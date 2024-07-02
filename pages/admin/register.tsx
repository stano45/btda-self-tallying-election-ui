import React, { useCallback, useState } from 'react';
import { TextInput, Button, Group, Container, List, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Candidate {
  name: string;
}

const RegisterPage = () => {
  const [name, setName] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !contract || !accounts.length) {
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
        showNotification(
          'Candidate registered',
          `Candidate ${name} has been registered successfully!`,
          'green'
        );
      } catch (error) {
        const errorMessage = `Failed to register candidate ${name}: ${error}`;
        // eslint-disable-next-line no-console
        console.error('Error registering candidate', error);
        showNotification('Registration failed', errorMessage, 'red');
      }
    },
    [name, contract, accounts, candidates, showNotification]
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
