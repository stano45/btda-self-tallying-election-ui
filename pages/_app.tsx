import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppShell, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { CryptoProvider, Web3Provider } from '@/contexts';
import { Header } from '@/components';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider defaultColorScheme="dark">
      <CryptoProvider>
        <Web3Provider>
          <ModalsProvider>
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
          </ModalsProvider>
        </Web3Provider>
      </CryptoProvider>
    </MantineProvider>
  );
}
