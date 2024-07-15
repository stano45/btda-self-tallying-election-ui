import React, { useCallback, useState } from 'react';
import {
  Button,
  Container,
  Title,
  Table,
  Text,
  Center,
  Divider,
  NumberInput,
  Group,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import router from 'next/router';
import { useCommitVote, useGetCandidates } from '@/hooks';
import { useWeb3 } from '@/contexts';
import { VotingStatus } from '@/types';

interface CandidateVote {
  candidateId: number;
  points: number;
}

const TOTAL_POINTS = 10;

const VotingPage = () => {
  const { votingStatus } = useWeb3();
  const { candidates, loading: getCandidatesLoading } = useGetCandidates();
  const { commitVote, loading: commitLoading } = useCommitVote();
  // const { submitVote, loading: submitLoading } = useSubmitVote();
  const loading = commitLoading || getCandidatesLoading;

  const [votes, setVotes] = useState<CandidateVote[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const maxPointsReached = totalPoints === TOTAL_POINTS;

  const handlePointsChange = useCallback(
    (candidateId?: number, points?: number) => {
      if (
        candidateId === undefined ||
        points === undefined ||
        points < 0 ||
        points > TOTAL_POINTS
      ) {
        return;
      }
      setVotes((prevVotes) => {
        const updatedVotes = prevVotes.map((vote) =>
          vote.candidateId === candidateId ? { ...vote, points } : vote
        );

        if (!updatedVotes.find((vote) => vote.candidateId === candidateId)) {
          updatedVotes.push({ candidateId, points });
        }

        const newTotalPoints = updatedVotes.reduce((acc, vote) => acc + vote.points, 0);

        if (newTotalPoints > TOTAL_POINTS) {
          return prevVotes;
        }

        setTotalPoints(newTotalPoints);
        return updatedVotes;
      });
    },
    [setVotes, setTotalPoints]
  );

  const handleVoteSubmit = useCallback(async () => {
    if (totalPoints !== TOTAL_POINTS) {
      return;
    }
    const voteArray = votes.map((vote) => vote.points);
    // const success = await submitVote(voteArray);
    const success = await commitVote(voteArray);
    if (!success) {
      return;
    }
    router.push('/voter/results');
  }, [totalPoints, votes, commitVote]);

  const openModal = useCallback(
    () =>
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
      }),
    [handleVoteSubmit]
  );

  if (votingStatus === VotingStatus.RegisterVoters) {
    return (
      <Container>
        <Center mt="lg">
          <Title order={2}>Please wait for other voters to register...</Title>
        </Center>
      </Container>
    );
  }

  return (
    <Container>
      <Title order={2} my="lg">
        Please distribute your {TOTAL_POINTS} points among the following candidates:
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Candidate</Table.Th>
            <Table.Th>Points</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {candidates.map((candidate) => {
            const candidateVote =
              votes.find((vote) => vote.candidateId === candidate.id)?.points || 0;
            return (
              <Table.Tr key={candidate.id}>
                <Table.Td>
                  <Text>{candidate.name}</Text>
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    min={0}
                    max={maxPointsReached ? candidateVote : TOTAL_POINTS}
                    value={candidateVote}
                    onChange={(value) => handlePointsChange(candidate.id, value as number)}
                    style={{ width: 100 }}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Divider my="lg" />
      <Center my="lg">
        <Group>
          <Text>
            Total points spent: {totalPoints}/{TOTAL_POINTS}
          </Text>
        </Group>
      </Center>
      <Center my="lg">
        <Button
          type="button"
          color="green"
          onClick={openModal}
          disabled={totalPoints !== TOTAL_POINTS || loading}
        >
          Submit Vote
        </Button>
      </Center>
    </Container>
  );
};

export default VotingPage;
