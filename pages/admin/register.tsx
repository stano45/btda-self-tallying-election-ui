import React, { useCallback, useEffect, useState } from 'react';
import { TextInput, Button, Group, Container, List, Title, ScrollArea, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import router from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { Candidate } from '@/types';
import { useGetCandidates } from '@/hooks/useGetCandidates';
import { useStartVoting } from '@/hooks/useStartVoting';
import { useAddCandidate } from '@/hooks/addCandidate';
import { useStartVotersRegistration } from '@/hooks/usestartVotersRegistration';

const RegisterPage = () => {
  const { contract, accounts } = useWeb3();
  const [name, setName] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const {
    candidates: registeredCandidates,
    reload: reloadCandidates,
    loading: getCandidatesLoading,
  } = useGetCandidates();
  const { startVotersRegistration, loading: startVotersRegistrationLoading } =
    useStartVotersRegistration();
  const { startVoting, loading: startVotingLoading } = useStartVoting();
  const { addCandidate, loading: addCandidateLoading } = useAddCandidate();
  const loading =
    getCandidatesLoading ||
    startVotingLoading ||
    addCandidateLoading ||
    startVotersRegistrationLoading;

  useEffect(() => {
    if (registeredCandidates) {
      setCandidates(registeredCandidates);
    }
  }, [registeredCandidates]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !contract || !accounts?.length) {
        return;
      }
      if (candidates.find((candidate) => candidate.name === name)) {
        notifications.show({
          title: 'Candidate already registered',
          message: `Candidate ${name} is already registered`,
          color: 'red',
        });
        return;
      }
      const result = await addCandidate(name);
      if (!result) {
        return;
      }
      reloadCandidates();
      setName('');
    },
    [name, contract, accounts, candidates]
  );

  const handleStartVoting = useCallback(async () => {
    const votersRegistrationResult = await startVotersRegistration();
    const startVotingResult = await startVoting();
    if (startVotingResult && votersRegistrationResult) {
      router.push('/admin/waiting');
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
        <Title my="lg">Register Candidates</Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Candidate Name"
            placeholder="Enter candidate name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            disabled={loading}
          />
          <Group mt="md">
            <Button type="submit" loading={loading}>
              Register
            </Button>
          </Group>
        </form>

        {!!candidates.length && (
          <Title order={3} my="lg">
            Registered Candidates
          </Title>
        )}
        <ScrollArea.Autosize mah={400} type="auto">
          <List>
            {candidates.map((candidate, index) => (
              <List.Item key={index}>
                {candidate.name} (id={candidate.id})
              </List.Item>
            ))}
          </List>
        </ScrollArea.Autosize>
        <Group mt="lg" justify="center">
          <Button loading={loading} onClick={openModal} disabled={!candidates.length} color="green">
            Start Election
          </Button>
        </Group>
      </Container>
    </>
  );
};

export default RegisterPage;
