import { useCallback } from 'react';
import router from 'next/router';
import { modals } from '@mantine/modals';
import { Button, Center, Container, Title, Text } from '@mantine/core';
import { useEndVoting } from '@/hooks';

const VotePage = () => {
  const { endVoting, loading: endVotingLoading } = useEndVoting();

  const handleEndVoting = useCallback(async () => {
    const result = await endVoting();
    if (result) {
      router.push('/admin/results');
    }
  }, [endVoting]);

  const openModal = () =>
    modals.openConfirmModal({
      title: (
        <Text size="sm" fw={500}>
          Confirm Election End
        </Text>
      ),
      children: <Text size="sm">Are you sure you want to end the election?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => handleEndVoting(),
    });
  return (
    <Container>
      <Center>
        <Title>Voting in progress </Title>
      </Center>

      <Center mt="lg">put some stats here</Center>
      <Center mt="lg">
        <Button color="red" onClick={openModal} loading={endVotingLoading}>
          End Voting
        </Button>
      </Center>
    </Container>
  );
};

export default VotePage;
