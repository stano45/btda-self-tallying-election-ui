import { AppShell, Text, Button, Group, Flex } from '@mantine/core';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts';

function Header() {
  const { selectedAccount, setSelectedAccount } = useWeb3();
  const router = useRouter();

  const handleLogout = () => {
    setSelectedAccount(undefined);
    router.push('/');
  };

  return (
    <AppShell.Header>
      <Group justify="space-between" style={{ width: '100%' }}>
        <Text mt="sm" ml="md" fw={700} size="lg">
          Self-Tallying Election
        </Text>
        <Flex direction="row" align="center">
          <Text mt="md" mr="md">
            {!!selectedAccount && <Text>Logged in as: {selectedAccount}</Text>}
          </Text>
          <Button variant="outline" onClick={handleLogout} mt="md" mr="md">
            Logout
          </Button>
        </Flex>
      </Group>
    </AppShell.Header>
  );
}

export default Header;
