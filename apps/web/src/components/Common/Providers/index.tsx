
import { apolloClient, ApolloProvider } from '@lensshare/lens/apollo';
import authLink from '@lib/authLink';
import { Analytics } from '@vercel/analytics/react';
import getLivepeerTheme from '@lib/getLivepeerTheme';
import {
  createReactClient,
  LivepeerConfig,
  studioProvider
} from '@livepeer/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ReactNode } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Layout from '../Layout';
import LensSubscriptionsProvider from './LensSubscriptionsProvider';
import Web3Provider from './Web3Provider';
import { BASE_URL } from '@lensshare/data/constants';
import SW from '@components/ServiceWorker';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ThemeProvider from './ThemeProvider';
import LeafwatchProvider from './LeafwatchProvider';
import OptimisticTransactionsProvider from './OptimisticTransactionsProvider';
import PreferencesProvider from './PreferencesProvider';
import LensAuthProvider from './LensAuthProvider';
import NotificationsProvider from './NotificationsProvider';
import { HuddleClient, HuddleProvider } from "@huddle01/react";

const lensApolloClient = apolloClient(authLink);
const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: '9e17a7ab-3370-4e31-85c3-43072da2315e',
    baseUrl: BASE_URL
  })
});
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});

 
const huddleClient = new HuddleClient({
  projectId: 'VsUyt6exV91LFUKiQ1kF89kOU0rL7i9a',
  options: {
    
    // `activeSpeakers` will be most active `n` number of peers, by default it's 8
    activeSpeakers: {
      size: 20,
    },
  },
});
 
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <SW />
      <LeafwatchProvider />
      <Web3Provider>
        <ApolloProvider client={lensApolloClient}>
          
          <LensAuthProvider/>
          <LensSubscriptionsProvider />
          <HuddleProvider client={huddleClient}>
          <OptimisticTransactionsProvider />
          <QueryClientProvider client={queryClient}>
         
            <PreferencesProvider />
            <LivepeerConfig client={livepeerClient} theme={getLivepeerTheme}>
              <ThemeProvider>
                <Layout>{children}</Layout>
              </ThemeProvider>
              <SpeedInsights />
              <Analytics />
            </LivepeerConfig>
          </QueryClientProvider>
          </HuddleProvider>
        </ApolloProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
};

export default Providers;
