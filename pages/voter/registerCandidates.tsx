import { useEffect } from 'react';
import { Container, List, ScrollArea, Title } from '@mantine/core';
import router from 'next/router';
import { VotingStatus } from '@/types';
import { useGetCandidates } from '@/hooks';
import { useWeb3 } from '@/contexts';

const RegisterCandidatesPage = () => {
  const { votingStatus } = useWeb3();
  console.log(votingStatus);

  useEffect(() => {
    if (votingStatus === VotingStatus.RegisterVoters) {
      router.push('/voter/registerVoters');
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

export default RegisterCandidatesPage;
