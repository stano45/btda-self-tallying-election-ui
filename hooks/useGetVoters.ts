import { useEffect, useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts';

export const useGetVoters = () => {
  const { contract } = useWeb3();
  const [voters, setVoters] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getVoters = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const result = await contract.methods.getVoters().call();
      setVoters(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching voters:', error);
      notifications.show({
        title: 'Error fetching voters',
        message: `Failed to fetch voters from the blockchain: ${error}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    getVoters();
  }, [getVoters]);

  return { voters, setVoters, reload: getVoters, loading };
};
