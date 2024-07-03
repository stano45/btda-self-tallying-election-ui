import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppShell, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { Web3Provider } from '@/contexts/Web3Context';
import Header from '@/components/Header';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Web3Provider>
        <Notifications position="top-right" zIndex={1000} />
        <Head>
          <title>Election</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
          <link rel="shortcut icon" href="/favicon.svg" />
        </Head>
        <AppShell header={{ height: 60 }} padding="md">
          <Header />
          <AppShell.Main>
            <Component {...pageProps} />
          </AppShell.Main>
        </AppShell>
      </Web3Provider>
    </MantineProvider>
  );
}
