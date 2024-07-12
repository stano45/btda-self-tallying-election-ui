import { useEffect } from 'react';
import { Container, List, ScrollArea, Title } from '@mantine/core';
import router from 'next/router';
import { VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts/Web3Context';
import { useGetCandidates } from '@/hooks';

const PreVoting = () => {
  const { votingStatus } = useWeb3();

  useEffect(() => {
    if (votingStatus === VotingStatus.Vote) {
      router.push('/voter/vote');
    }
  }, [votingStatus]);

  const { candidates: registeredCandidates, reload: reloadCandidates } = useGetCandidates();

  useEffect(() => {
    const intervalId = setInterval(() => {
      reloadCandidates();
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [reloadCandidates]);

  return (
    <Container>
      <Title>The administrator is registering candidates, please wait.</Title>
      {!!registeredCandidates.length && (
        <Title order={3} my="lg">
          Registered Candidates
        </Title>
      )}
      <ScrollArea.Autosize mah={400} type="auto">
        <List>
          {registeredCandidates.map((candidate, index) => (
            <List.Item key={index}>{candidate.name}</List.Item>
          ))}
        </List>
      </ScrollArea.Autosize>
    </Container>
  );
};

export default PreVoting;
