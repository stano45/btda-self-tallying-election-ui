import { useEffect } from 'react';
import router from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { VotingStatus } from '@/types';
import { Center, Container, Title } from '@mantine/core';

const Waiting = () => {
  const { votingStatus } = useWeb3();
  useEffect(() => {
    if (votingStatus === VotingStatus.Post) {
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
          src="https://giphy.com/embed/QBd2kLB5qDmysEXre9"
          width="480"
          height="288"
          frameBorder="0"
          class="giphy-embed"
          allowFullScreen
        ></iframe>
      </Center>
    </Container>
  );
};

export default Waiting;
