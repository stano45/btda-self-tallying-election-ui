import { useCallback } from 'react';
import { Button, Center, Container, Title, Text, Flex } from '@mantine/core';
import router from 'next/router';
import { modals } from '@mantine/modals';
import { useRegisterVoter } from '@/hooks/useRegisterVoter';

const RegisterVotersPage = () => {
  const { registerVoter, loading } = useRegisterVoter();

  const register = useCallback(async () => {
    const result = await registerVoter();
    if (result) {
      router.push('/voter/vote');
    }
  }, [registerVoter]);

  const openModal = () =>
    modals.openConfirmModal({
      title: (
        <Text size="sm" fw={500}>
          Confirm Election Start
        </Text>
      ),
      children: <Text size="sm">Are you sure you want to register for this election?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => register(),
    });

  return (
    <Container>
      <Center mt="lg">
        <Flex direction="column" align="center" gap="xl">
          <Title>Register for this election as a voter?</Title>
          <Button loading={loading} onClick={openModal} color="green">
            Register
          </Button>
        </Flex>
      </Center>
    </Container>
  );
};

export default RegisterVotersPage;
