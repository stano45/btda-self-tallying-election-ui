import { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Button, Container, Title } from '@mantine/core';
import router from 'next/router';
import { useWeb3 } from '@/contexts';

export default function HomePage() {
  const { accounts, selectAccount: setAccountContext } = useWeb3();
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();

  const accountsData = useMemo(() => {
    if (accounts) {
      return accounts.map((account, index) => ({
        value: account.name,
        label: index === 0 ? `${account.name} (admin)` : `${account.name} (${index})`,
      }));
    }
    return [];
  }, [accounts]);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setSelectedAccount(accounts[0].name);
    }
  }, [accounts]);

  const handleAccountChange = useCallback((value: string | null | undefined) => {
    if (!value) {
      return;
    }
    setSelectedAccount(value);
  }, []);

  const handleLogin = () => {
    if (!selectedAccount) {
      return;
    }
    setAccountContext(selectedAccount);
    if (accounts?.[0].name === selectedAccount) {
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
