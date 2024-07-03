import React from 'react';
import { Container, Title } from '@mantine/core';

const VoterPage = () => {
  //   useEffect(() => {
  //     router.push('/voter/vote');
  //   });
  // eslint-disable-next-line no-console
  console.log('VoterPage');
  return (
    <Container>
      <Title order={2} my="lg">
        Voter Page
      </Title>
    </Container>
  );
};

export default VoterPage;
