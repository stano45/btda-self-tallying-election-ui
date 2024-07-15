import { Center, Container, Table, Title } from '@mantine/core';
import { Candidate } from '@/types';

const ResultsPage = () => {
  const winner: Candidate = {
    id: 123,
    name: 'sample candidate',
    yesVotes: 123,
    noVotes: 456,
  };
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

export default ResultsPage;
