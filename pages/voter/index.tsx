import React from 'react';
import { Button, Container, Title } from '@mantine/core';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import { useWeb3 } from '@/contexts/Web3Context';
import { useGetVotingStatus } from '@/hooks/useGetVotingState';
import { VotingStatus } from '@/types';

const VoterPage = () => {
  const { votingStatus } = useWeb3();
  console.log(votingStatus);
  //   useEffect(() => {
  //     router.push('/voter/vote');
  //   });
  // eslint-disable-next-line no-console
  return (
    <Container>
      {votingStatus === VotingStatus.Pre && (
        <Title order={2} my="lg">
          Voting has not started yet
        </Title>
      )}
      {votingStatus === VotingStatus.Vote && (
        <Title order={2} my="lg">
          Voting is in progress
        </Title>
      )}
      {votingStatus === VotingStatus.Post && (
        <Title order={2} my="lg">
          Voting has ended
        </Title>
      )}
    </Container>
  );
};

export default VoterPage;
