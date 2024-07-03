import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts/Web3Context';

export const useSubmitVote = () => {
  const { contract, accounts } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  const submitVote = useCallback(
    async (candidateId: string, vote: boolean): Promise<boolean> => {
      if (!contract || !accounts || !accounts.length) return false;

      setLoading(true);
      try {
        await contract.methods
          .vote(parseInt(candidateId, 10), vote)
          .send({ from: accounts[0], gas: '1000000', gasPrice: 1000000000 });
        notifications.show({
          title: 'Vote Submitted',
          message: 'Your vote has been submitted successfully',
          color: 'green',
        });
        return true;
      } catch (error) {
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
    [contract, accounts]
  );

  return { submitVote, loading };
};
