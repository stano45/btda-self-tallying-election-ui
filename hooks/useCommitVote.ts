import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { CommitArgs } from '@/types';
import { transformCommitArgsToSmartContract } from '@/transformers/transformers';
import { useWeb3 } from '@/contexts';

export const useCommitVote = () => {
  const { contract, selectedAccount } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);
  const commitVote = useCallback(
    async (args: CommitArgs): Promise<boolean> => {
      if (!contract || !selectedAccount) return false;

      setLoading(true);
      const data = transformCommitArgsToSmartContract(args);
      try {
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
    [contract, selectedAccount]
  );

  return { commitVote, loading };
};
