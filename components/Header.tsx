import { AppShell, Text, Button, Group, Flex, Tooltip } from '@mantine/core';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts';

export function Header() {
  const { selectedAccount, selectAccount: setSelectedAccount } = useWeb3();
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
        {!!selectedAccount?.name && selectedAccount.index !== undefined && (
          <Flex direction="row" align="center">
            <Text mt="md" mr="md">
              <Tooltip label={`Account ID: ${selectedAccount.name}`}>
                <Flex direction="row" align="center" gap="sm">
                  <Text>Account:</Text>
                  <Text fw={500}>
                    {selectedAccount.index === 0 ? 'Admin' : `Voter ${selectedAccount.index}`}
                  </Text>
                </Flex>
              </Tooltip>
            </Text>
            <Button variant="outline" onClick={handleLogout} mt="md" mr="md">
              Logout
            </Button>
          </Flex>
        )}
      </Group>
    </AppShell.Header>
  );
}
