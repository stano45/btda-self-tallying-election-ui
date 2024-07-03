import { useEffect, useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts/Web3Context';
import { Candidate } from '@/types';

export const useGetCandidates = () => {
  const { contract } = useWeb3();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getCandidates = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const result = await contract.methods.getCandidates().call();
      const formattedCandidates = result.map((candidate: any) => ({
        id: candidate.id.toString(),
        name: candidate.name,
      }));
      setCandidates(formattedCandidates);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching candidates:', error);
      notifications.show({
        title: 'Error fetching candidates',
        message: `Failed to fetch candidates from the blockchain: ${error}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    getCandidates();
  }, [getCandidates]);

  return { candidates, setCandidates, reload: getCandidates, loading };
};
