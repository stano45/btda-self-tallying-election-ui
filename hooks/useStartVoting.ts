import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts/Web3Context';

export const useStartVoting = () => {
  const { contract, accounts } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  const startVoting = useCallback(async (): Promise<boolean> => {
    if (!contract || !accounts || accounts.length === 0) return false;

    setLoading(true);
    try {
      await contract.methods
        .startVoting()
        .send({ from: accounts[0], gas: '1000000', gasPrice: 1000000000 });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting voting:', error);
      notifications.show({
        title: 'Voting Start Failed',
        message: `Failed to start voting: ${error}`,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, accounts]);

  return { startVoting, loading };
};
