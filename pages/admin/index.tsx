import React, { useEffect } from 'react';
import { Container, Title } from '@mantine/core';
import router from 'next/router';

const AdminPage = () => {
  useEffect(() => {
    router.push('/admin/registerCandidates');
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
