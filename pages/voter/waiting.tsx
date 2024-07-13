import { useEffect } from 'react';
import router from 'next/router';
import { Center, Container, Title } from '@mantine/core';
import { VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts';

const Waiting = () => {
  const { votingStatus } = useWeb3();
  useEffect(() => {
    if (votingStatus === VotingStatus.End) {
      router.push('/voter/post');
    }
  }, [votingStatus]);
  return (
    <Container>
      <Center>
        <Title> Thanks for voting! Waiting for other participants... </Title>
      </Center>

      <Center mt="lg">
        <iframe
          title="waiting-gif"
          src="https://giphy.com/embed/QBd2kLB5qDmysEXre9"
          frameBorder="0"
          width="480"
          height="288"
        />
      </Center>
    </Container>
  );
};

export default Waiting;
