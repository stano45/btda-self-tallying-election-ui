import React, { useCallback, useEffect } from 'react';
import { Button, Group, Container, List, Title, ScrollArea, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import router from 'next/router';
import { useGetVoters, useStartVoting } from '@/hooks';

const RegisterVotersPage = () => {
  const { voters, reload: reloadVoters } = useGetVoters();

  useEffect(() => {
    const intervalId = setInterval(() => {
      reloadVoters();
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [reloadVoters]);

  const { startVoting, loading } = useStartVoting();
  const handleStartVoting = useCallback(async () => {
    const startVotingResult = await startVoting();
    if (startVotingResult) {
      router.push('/admin/vote');
    }
  }, [startVoting]);

  const openModal = () =>
    modals.openConfirmModal({
      title: (
        <Text size="sm" fw={500}>
          Confirm Election Start
        </Text>
      ),
      children: <Text size="sm">Are you sure you want to start the election?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => handleStartVoting(),
    });

  return (
    <>
      <Container>
        <Title my="lg">Voters Are Registering</Title>
        {!!voters.length && (
          <Title order={3} my="lg">
            Registered Candidates
          </Title>
        )}
        <ScrollArea.Autosize mah={400} type="auto">
          <List>
            {voters.map((voter, index) => (
              <List.Item key={index}>{voter}</List.Item>
            ))}
          </List>
        </ScrollArea.Autosize>
        <Group mt="lg" justify="center">
          <Button loading={loading} onClick={openModal} disabled={!voters.length} color="green">
            Start Election
          </Button>
        </Group>
      </Container>
    </>
  );
};

export default RegisterVotersPage;
