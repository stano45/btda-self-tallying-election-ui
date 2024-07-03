import React, { useCallback, useState } from 'react';
import {
  Button,
  Container,
  Title,
  RadioGroup,
  Radio,
  Table,
  Text,
  Center,
  Divider,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import router from 'next/router';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import { useGetCandidates } from '@/hooks/useGetCandidates';

interface CandidateVote {
  candidateId: number;
  vote: string;
}

const VotingPage = () => {
  const { candidates } = useGetCandidates();
  const { submitVote, loading } = useSubmitVote();
  const [selectedVote, setSelectedVote] = useState<CandidateVote>();

  const handleVoteChange = useCallback(
    (candidateId: number | undefined, value: string) => {
      if (!candidateId) {
        return;
      }
      setSelectedVote({ candidateId, vote: value });
    },
    [selectedVote, setSelectedVote]
  );

  const handleVoteSubmit = useCallback(async () => {
    if (!selectedVote) {
      return;
    }
    const success = await submitVote(selectedVote.candidateId, selectedVote.vote === 'yes');
    if (!success) {
      return;
    }
    router.push('/voter/waiting');
  }, [selectedVote, router, submitVote]);

  const openModal = () =>
    modals.openConfirmModal({
      title: (
        <Text size="sm" fw={500}>
          Confirm Vote
        </Text>
      ),
      children: <Text size="sm">Are you sure you want to submit your vote?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => handleVoteSubmit(),
    });
  return (
    <Container>
      <Title order={2} my="lg">
        Please vote for the following candidate(s):
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Candidate</Table.Th>
            <Table.Th>Yes</Table.Th>
            <Table.Th>No</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {candidates.map((candidate) => (
            <Table.Tr key={candidate.id}>
              <Table.Td>
                <Text align="left">{candidate.name}</Text>
              </Table.Td>
              <Table.Td>
                <RadioGroup
                  value={
                    selectedVote?.candidateId === candidate.id && selectedVote?.vote === 'yes'
                      ? 'yes'
                      : ''
                  }
                  onChange={(value) => handleVoteChange(candidate.id, value)}
                  style={{ display: 'flex', justifyContent: 'left' }}
                >
                  <Radio value="yes" />
                </RadioGroup>
              </Table.Td>
              <Table.Td>
                <RadioGroup
                  value={
                    selectedVote?.candidateId === candidate.id && selectedVote?.vote === 'no'
                      ? 'no'
                      : ''
                  }
                  onChange={(value) => handleVoteChange(candidate.id, value)}
                  style={{ display: 'flex', justifyContent: 'left' }}
                >
                  <Radio value="no" />
                </RadioGroup>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Divider my="lg" />
      <Center my="lg">
        <Button type="button" color="green" onClick={openModal} disabled={!selectedVote || loading}>
          Submit Vote
        </Button>
      </Center>
    </Container>
  );
};

export default VotingPage;
