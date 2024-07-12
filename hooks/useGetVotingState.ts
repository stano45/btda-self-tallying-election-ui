import { useEffect, useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts';

export const useGetVotingStatus = () => {
  const { contract } = useWeb3();
  const [votingStatus, setVotingStatus] = useState<VotingStatus>();
  const [loading, setLoading] = useState<boolean>(false);

  const getVotingStatus = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const result = (await contract.methods.getVotingStatus().call()) as VotingStatus;
      // eslint-disable-next-line no-console
      console.log(result);
      setVotingStatus(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching voting state:', error);
      notifications.show({
        title: 'Error fetching voting state',
        message: `Failed to fetch voting state from the blockchain: ${error}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    getVotingStatus();
  }, [getVotingStatus]);

  return {
    votingStatus,
    reload: getVotingStatus,
    loading,
  };
};
