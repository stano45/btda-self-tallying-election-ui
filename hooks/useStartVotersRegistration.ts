import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts';

export const useStartVotersRegistration = () => {
  const { contract, selectedAccount } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  const startVotersRegistration = useCallback(async (): Promise<boolean> => {
    if (!contract || !selectedAccount) return false;

    setLoading(true);
    try {
      await contract.methods
        .startVotersRegistration()
        .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting voter registration:', error);
      notifications.show({
        title: 'Starting Voter Registration Failed',
        message: `Failed to start voter registration: ${error}`,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, selectedAccount]);

  return { startVotersRegistration, loading };
};
