import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { transformCommitArgsToSmartContract } from '@/transformers/transformers';
import { useCrypto, useWeb3 } from '@/contexts';
import { getCommitArgs, getVoterKeys } from '@/crypto/crypto';

const MY_NUMBER = 1;
const NUM_VOTERS = 2;

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
      const voterKeys = getVoterKeys(keyPair, votes.length, NUM_VOTERS, MY_NUMBER);
      const args = getCommitArgs(
        keyPair?.privateKey,
        votes,
        voterKeys.randKeys,
        MY_NUMBER,
        votes.length
      );
      const data = transformCommitArgsToSmartContract(args);
      try {
        console.log('Committing: ', data.xis, data.nus, data.proof1, data.proof2, data.w_i);
        await contract.methods
          .commitVote(data.xis, data.nus, data.proof1, data.proof2, data.w_i)
          .send({ from: selectedAccount, gas: '1000000', gasPrice: 1000000000 });
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
