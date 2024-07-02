import { useCallback, useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Container,
  List,
  Title,
  DefaultMantineColor,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

const RegisterPage = () => {
  const [name, setName] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [candidates, setCandidates] = useState<{ name: string; party: string }[]>([]);

  const showNotification = useCallback(
    (title: string, message: string, color: DefaultMantineColor) => {
      notifications.show({
        title,
        message,
        color,
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !id) {
        return;
      }
      setCandidates([...candidates, { name, party: id }]);
      setName('');
      setId('');
      showNotification(
        'Candidate registered',
        `Candidate ${name} has been registered successfully!`,
        'green'
      );
    },
    [name, id]
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
        <TextInput
          label="Candidate ID"
          placeholder="Enter candidate ID"
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
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
          <List.Item key={index}>
            {candidate.name} ({candidate.party})
          </List.Item>
        ))}
      </List>
    </Container>
  );
};

export default RegisterPage;
