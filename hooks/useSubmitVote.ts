import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts';

export const useSubmitVote = () => {
  const { contract, selectedAccount } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);
  const submitVote = useCallback(
    async (votes: number[]): Promise<boolean> => {
      if (!contract || !selectedAccount) return false;

      setLoading(true);
      try {
        await contract.methods
          .vote(votes)
          .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });
        notifications.show({
          title: 'Vote Submitted',
          message: 'Your vote has been submitted successfully',
          color: 'green',
        });
        return true;
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error submitting vote:', error);
        notifications.show({
          title: 'Vote Submission Failed',
          message: `Failed to submit vote: ${error.message}`,
          color: 'red',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contract, selectedAccount]
  );

  return { submitVote, loading };
};
