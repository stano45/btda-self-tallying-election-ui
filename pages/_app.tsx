import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { Web3Provider } from '@/contexts/Web3Context';

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
        <Component {...pageProps} />
      </Web3Provider>
    </MantineProvider>
  );
}
