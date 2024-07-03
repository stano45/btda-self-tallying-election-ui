import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts/Web3Context';

export const useSubmitVote = () => {
  const { contract, accounts } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  const submitVote = useCallback(
    async (candidateId: number, vote: boolean) => {
      if (!contract || !accounts || accounts.length === 0) return;

      setLoading(true);
      try {
        await contract.methods
          .vote(candidateId, vote)
          .send({ from: accounts[0], gas: '1000000', gasPrice: 1000000000 });
        notifications.show({
          title: 'Vote Submitted',
          message: 'Your vote has been submitted successfully',
          color: 'green',
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error submitting vote:', error);
        notifications.show({
          title: 'Vote Submission Failed',
          message: `Failed to submit vote: ${error.message}`,
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    },
    [contract, accounts]
  );

  return { submitVote, loading };
};
