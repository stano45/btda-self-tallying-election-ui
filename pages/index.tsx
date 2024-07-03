import { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Button, Container, Title } from '@mantine/core';
import router from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';

export default function HomePage() {
  const { accounts, setSelectedAccount: setAccountContext } = useWeb3();
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();

  const accountsData = useMemo(() => {
    if (accounts) {
      return accounts.map((account, index) => ({
        value: account,
        label: index === 0 ? `${account} (admin)` : `${account} (${index})`,
      }));
    }
    return [];
  }, [accounts]);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts]);

  const handleAccountChange = useCallback((value: string | null | undefined) => {
    if (value === null) {
      return;
    }
    setSelectedAccount(value);
  }, []);

  const handleLogin = () => {
    if (!selectedAccount) {
      return;
    }
    setAccountContext(selectedAccount);
    if (accounts?.[0] === selectedAccount) {
      router.push('/admin');
    } else {
      router.push('/voter');
    }
  };

  return (
    <Container>
      <Title order={2} my="lg">
        Login
      </Title>
      <Select
        placeholder="Pick one"
        data={accountsData}
        value={selectedAccount}
        onChange={handleAccountChange}
      />
      <Button onClick={handleLogin} mt="md">
        Login
      </Button>
    </Container>
  );
}
