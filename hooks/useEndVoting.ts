import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts';

export const useEndVoting = () => {
  const { contract, selectedAccount } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  const endVoting = useCallback(async (): Promise<boolean> => {
    if (!contract || !selectedAccount) return false;

    setLoading(true);
    try {
      await contract.methods
        .endVoting()
        .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error ending voting:', error);
      notifications.show({
        title: 'Voting End Failed',
        message: `Failed to end voting: ${error}`,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, selectedAccount]);

  return { endVoting, loading };
};
