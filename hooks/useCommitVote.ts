import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import BN from 'bn.js';
import { ec as EC } from 'elliptic';
import { useCrypto, useWeb3 } from '@/contexts';
import { getCommitArgs } from '@/crypto/crypto';
import { transformCommitArgsToApi } from '@/transformers/transformers';
import { BP } from '@/types';

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
        console.log('Public keys:', pubKeysBN);
        const ec = new EC('bn256');
        const pkBasePoints: BP[] = pubKeysBN.map((key: BN[]) => ec.curve.point(key[0], key[1]));

        const args = getCommitArgs(
          keyPair?.privateKey,
          votes,
          pkBasePoints,
          selectedAccount.index,
          votes.length
        );
        console.log('Commit args:', args);
        const apiArgs = transformCommitArgsToApi(args);
        console.log('Committing vote:', apiArgs);
        await contract.methods
          .commitVote(apiArgs.xis, apiArgs.nus, apiArgs.proof1, apiArgs.proof2, apiArgs.W_i)
          .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });
        notifications.show({
          title: 'Vote Committed',
          message: 'Your vote has been commited successfully',
          color: 'green',
        });
        return true;
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error committing vote:', error);
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
    [contract, keyPair, selectedAccount]
  );

  return { commitVote, loading };
};
