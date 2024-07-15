import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts';

export const useAddCandidate = () => {
  const { contract, selectedAccount } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  const addCandidate = useCallback(
    async (name: string): Promise<boolean> => {
      if (!contract || !selectedAccount) return false;

      setLoading(true);
      try {
        await contract.methods
          .addCandidate(name)
          .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });
        notifications.show({
          title: 'Registration successful',
          message: `Candidate ${name} registered successfully`,
          color: 'blue',
        });
        return true;
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error registering candidate', error);
        notifications.show({
          title: 'Registration failed',
          message: `Failed to register candidate ${name}: ${error}`,
          color: 'red',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contract, selectedAccount]
  );

  return { addCandidate, loading };
};
