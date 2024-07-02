import React, { useCallback, useState, useEffect } from 'react';
import Web3 from 'web3';
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
import YesNoVoting from '../../contracts/YesNoVoting.json';

interface Candidate {
  name: string;
}

const RegisterPage = () => {
  const [name, setName] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [contract, setContract] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [web3, setWeb3] = useState<any>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = new Web3('http://127.0.0.1:8545'); // Connect to local Ganache
      try {
        const ethAccounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = YesNoVoting.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          YesNoVoting.abi,
          deployedNetwork && deployedNetwork.address
        );
        setWeb3(web3Instance);
        setAccounts(ethAccounts);
        setContract(instance);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Could not connect to wallet', error);
        showNotification('Connection failed', 'Could not connect to wallet', 'red');
      }
    };
    initWeb3();
  }, []);

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
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !contract || !accounts.length) {
        return;
      }
      if (candidates.find((candidate) => candidate.name === name)) {
        showNotification(
          'Candidate already registered',
          `Candidate ${name} is already registered`,
          'red'
        );
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
