import React, { useCallback, useState } from 'react';
import { TextInput, Button, Group, Container, List, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useWeb3 } from '@/contexts/Web3Context';

interface Candidate {
  name: string;
}

const RegisterPage = () => {
  const { contract, accounts } = useWeb3();
  const [name, setName] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !contract || !accounts?.length) {
        return;
      }
      if (candidates.find((candidate) => candidate.name === name)) {
        notifications.show({
          title: 'Candidate already registered',
          message: `Candidate ${name} is already registered`,
          color: 'red',
        });
        return;
      }
      try {
        await contract.methods
          .addCandidate(name)
          .send({ from: accounts[0], gas: '1000000', gasPrice: 1000000000 });
        setCandidates([...candidates, { name }]);
        setName('');
        notifications.show({
          title: 'Candidate registered',
          message: `Candidate ${name} registered successfully`,
          color: 'blue',
        });
      } catch (error) {
        const errorMessage = `Failed to register candidate ${name}: ${error}`;
        // eslint-disable-next-line no-console
        console.error('Error registering candidate', error);
        notifications.show({
          title: 'Registration failed',
          message: errorMessage,
          color: 'red',
        });
      }
    },
    [name, contract, accounts, candidates]
  );

  return (
    <Container>
      <Title order={2} my="lg">
        Register Candidates
      </Title>

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Candidate Name"
          placeholder="Enter candidate name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <Group mt="md">
          <Button type="submit">Register</Button>
        </Group>
      </form>

      {!!candidates.length && (
        <Title order={3} my="lg">
          Registered Candidates
        </Title>
      )}
      <List>
        {candidates.map((candidate, index) => (
          <List.Item key={index}>{candidate.name}</List.Item>
        ))}
      </List>
    </Container>
  );
};

export default RegisterPage;
