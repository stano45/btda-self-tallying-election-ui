import { Center, Container, Table, Title } from '@mantine/core';
import { Candidate, VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts';

const PostVoting = () => {
  const { votingStatus } = useWeb3();

  const winner: Candidate = {
    id: 123,
    name: 'sample candidate',
    yesVotes: 123,
    noVotes: 456,
  };

  // Voting has not ended yet
  if (votingStatus === VotingStatus.Vote) {
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
  }

  return (
    <Container>
      <Title>Election Result</Title>
      {!!winner && (
        <Center>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Yes Votes</Table.Th>
                <Table.Th>No Votes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>{winner.name}</Table.Td>
                <Table.Td>{winner.id}</Table.Td>
                <Table.Td>{winner.yesVotes}</Table.Td>
                <Table.Td>{winner.noVotes}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Center>
      )}
    </Container>
  );
};

export default PostVoting;
