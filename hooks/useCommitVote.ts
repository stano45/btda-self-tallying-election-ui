import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import BN from 'bn.js';
import { ec as EC } from 'elliptic';
import { useCrypto, useWeb3 } from '@/contexts';
import { getCommitArgs } from '@/crypto/crypto';

const MY_NUMBER = 1;

export const useCommitVote = () => {
  const { contract, selectedAccount } = useWeb3();
  const { keyPair } = useCrypto();
  const [loading, setLoading] = useState<boolean>(false);
  const commitVote = useCallback(
    async (votes: number[]): Promise<boolean> => {
      if (!contract || !selectedAccount || !keyPair) {
        notifications.show({
          title: 'Vote Commit Failed',
          message: 'Please connect your wallet to commit vote',
          color: 'red',
        });
        // eslint-disable-next-line no-console
        console.error('Cannot commit vote: contract, selectedAccount or keyPair is missing');
        return false;
      }
      setLoading(true);
      try {
        const pubKeysBN = await contract.methods
          .getVoterPublicKeys()
          .call({ from: selectedAccount.name, gas: '1000000', gasPrice: '1000000000' });

        // Check if pubKeysBN is an array and has even number of elements
        if (!Array.isArray(pubKeysBN) || pubKeysBN.length % 2 !== 0) {
          throw new Error('Public keys array is invalid or malformed');
        }

        const pkBasePoints = [];
        for (let i = 0; i < pubKeysBN.length; i += 2) {
          const x = new BN(pubKeysBN[i], 16);
          const y = new BN(pubKeysBN[i + 1], 16);

          const ec = new EC('bn256');
          const basePoint = ec.curve.point(x, y);
          pkBasePoints.push(basePoint);
        }
        console.log('Public keys:', pkBasePoints);
        const args = getCommitArgs(
          keyPair?.privateKey,
          votes,
          pkBasePoints,
          MY_NUMBER,
          votes.length
        );
        args;
        // TODO
        await contract.methods
          .commitVote()
          .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });
        notifications.show({
          title: 'Vote Committed',
          message: 'Your vote has been commited successfully',
          color: 'green',
        });
        return true;
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error committing vote:', error.message);
        notifications.show({
          title: 'Vote Commit Failed',
          message: `Failed to commit vote: ${error.message}`,
          color: 'red',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contract, selectedAccount]
  );

  return { commitVote, loading };
};
