import { AppShell, Text, Button, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';

function Header() {
  const { setSelectedAccount } = useWeb3();
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
        <Button variant="outline" onClick={handleLogout} mt="md" mr="md">
          Logout
        </Button>
      </Group>
    </AppShell.Header>
  );
}

export default Header;
