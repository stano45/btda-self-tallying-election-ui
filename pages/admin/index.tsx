import React, { useEffect } from 'react';
import { Container, Title } from '@mantine/core';
import router from 'next/router';
import { VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts';

const AdminPage = () => {
  const { votingStatus } = useWeb3();
  useEffect(() => {
    switch (votingStatus) {
      case VotingStatus.RegisterCandidates:
        router.push('/admin/registerCandidates');
        break;
      case VotingStatus.RegisterVoters:
        router.push('/admin/registerVoters');
        break;
      case VotingStatus.Commit:
      case VotingStatus.Vote:
        router.push('/admin/vote');
        break;
      case VotingStatus.End:
        router.push('/admin/results');
        break;
      default:
        router.push('/admin/registerCandidates');
        break;
    }
  });
  return (
    <Container>
      <Title order={2} my="lg">
        Admin Page
      </Title>
    </Container>
  );
};

export default AdminPage;
