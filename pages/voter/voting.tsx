import React from 'react';
import { Button, Container, Title } from '@mantine/core';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import { useWeb3 } from '@/contexts/Web3Context';

const VotingPage = () => {
  //   useEffect(() => {
  //     router.push('/voter/vote');
  //   });
  // eslint-disable-next-line no-console

  const { submitVote, loading } = useSubmitVote();
  const handleVote = (candidateId: number, vote: boolean) => {
    submitVote(candidateId, vote);
  };
  return (
    <Container>
      <Title order={2} my="lg">
        Voter Page
      </Title>
      <Button type="button" onClick={() => handleVote(1, true)}>
        Vote Yes
      </Button>
    </Container>
  );
};

export default VotingPage;
