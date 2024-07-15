import React, { useCallback, useState } from 'react';
import {
  Button,
  Container,
  Title,
  Table,
  Text,
  Center,
  NumberInput,
  Group,
  Slider,
  Flex,
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
      <Table striped highlightOnHover withColumnBorders horizontalSpacing="xl">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '50%' }}>Candidate</Table.Th>
            <Table.Th style={{ width: '50%' }}>Points</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {candidates.map((candidate) => {
            const candidateVote =
              votes.find((vote) => vote.candidateId === candidate.id)?.points || 0;
            return (
              <Table.Tr key={candidate.id}>
                <Table.Td style={{ width: '50%' }}>
                  <Text>{candidate.name}</Text>
                </Table.Td>
                <Table.Td style={{ width: '50%' }}>
                  <Flex align="center" justify="center" direction="row" gap="lg">
                    <NumberInput
                      w="4rem"
                      my="lg"
                      min={0}
                      max={maxPointsReached ? candidateVote : TOTAL_POINTS}
                      value={candidateVote}
                      onChange={(value) => handlePointsChange(candidate.id, value as number)}
                      style={{ width: 100 }}
                      hideControls
                    />
                    <Slider
                      w="20rem"
                      value={candidateVote}
                      onChange={(value) => handlePointsChange(candidate.id, value)}
                      max={TOTAL_POINTS}
                      style={{ width: '100%' }}
                      marks={[
                        { value: 0, label: 0 },
                        { value: TOTAL_POINTS, label: TOTAL_POINTS },
                      ]}
                      mb="lg"
                    />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Center my="lg">
        <Group>
          <Text fw={800}>Points Remaining: {TOTAL_POINTS - totalPoints}</Text>
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
