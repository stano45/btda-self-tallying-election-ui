import { useEffect, useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts/Web3Context';
import { Candidate } from '@/types';
import { transformCandidateFromApi } from '@/transformers/transformers';

export const useGetWinner = () => {
  const { contract } = useWeb3();
  const [winner, setWinner] = useState<Candidate>();
  const [loading, setLoading] = useState<boolean>(false);

  const getWinner = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const result = await contract.methods.getWinner().call();
      const transformedCandidate = transformCandidateFromApi(result);
      // eslint-disable-next-line no-console
      console.log(transformedCandidate);
      setWinner(transformedCandidate);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching winner:', error);
      notifications.show({
        title: 'Error fetching winner',
        message: `Failed to fetch winner from the blockchain: ${error}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    getWinner();
  }, [getWinner]);

  return {
    winner,
    reload: getWinner,
    loading,
  };
};
