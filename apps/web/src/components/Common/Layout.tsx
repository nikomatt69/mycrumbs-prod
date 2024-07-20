import GlobalAlerts from '@components/Shared/GlobalAlerts';
import GlobalBanners from '@components/Shared/GlobalBanners';
import BottomNavigation from '@components/Shared/Navbar/BottomNavigation';
import type { Profile } from '@lensshare/lens';
import { useCurrentProfileQuery } from '@lensshare/lens';
import getToastOptions from '@lib/getToastOptions';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import { useEffect, type FC, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore} from 'src/store/persisted/useAppStore';

import { useEffectOnce, useIsMounted } from 'usehooks-ts';
import { useAccount, useDisconnect } from 'wagmi';
import GlobalModals from '../Shared/GlobalModals';
import Loading from '../Shared/Loading';
import Navbar from '../Shared/Navbar';
import { isAddress } from 'viem';
import { useRoom } from '@huddle01/react/hooks';
import SpacesWindow from './SpacesWindow/SpacesWindow';
import { useRouter } from 'next/router';

import { useSpacesStore } from 'src/store/persisted/spaces';
import React from 'react';

import getCurrentSession from '@lib/getCurrentSession';

import { usePreferencesStore } from 'src/store/non-persisted/usePreferencesStore';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { hydrateAuthTokens, signOut } from 'src/store/persisted/useAuthStore';


import { CachedConversation, useStreamMessages } from '@xmtp/react-sdk';
import { useMessagesStore } from 'src/store/non-persisted/useMessagesStore';
import { useIsClient } from '@uidotdev/usehooks';
import { useDisconnectXmtp } from 'src/hooks/useXmtpClient';
interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  const { currentProfile, setCurrentProfile, setFallbackToCuratedFeed } =
    useAppStore();
  const { setLensHubOnchainSigNonce } = useNonceStore();
  const isMounted = useIsClient();
  const { disconnect } = useDisconnect();

  const { id: sessionProfileId } = getCurrentSession();

  const logout = (reload = false) => {
    
    signOut();
    disconnect?.();
    if (reload) {
      location.reload();
    }
  };
  const { state } = useRoom();
  const { loading } = useCurrentProfileQuery({
    onCompleted: ({ profile, userSigNonces }) => {
      setCurrentProfile(profile as Profile);
      setLensHubOnchainSigNonce(userSigNonces.lensHubOnchainSigNonce);

      // If the user has no following, we should fallback to the curated feed
      if (profile?.stats.followers === 0) {
        setFallbackToCuratedFeed(true);
      }
    },
    onError: () => logout(true),
    skip: !sessionProfileId || isAddress(sessionProfileId),
    variables: { request: { forProfileId: sessionProfileId } }
  });

  const validateAuthentication = () => {
    const { accessToken } = hydrateAuthTokens();

    if (!accessToken) {
      logout();
    }
  };
 
  useSpacesStore();

  useEffect(() => {
    validateAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileLoading = !currentProfile && loading;

  if (profileLoading || !isMounted) {
    return <Loading />;
  }
  

  return (
    <>
      <Head>
        <meta
          name="theme-color"
          content={resolvedTheme === 'dark' ? '#1b1b1d' : '#ffffff'}
        />
        
        <link rel="manifest" href="/manifest.json" />

        <meta name="viewport" content="width=device-width, initial-scale=0.8 , maximum-scale=2" />
      </Head>
      <Toaster
        position="bottom-right"
        containerStyle={{ wordBreak: 'break-word' }}
        toastOptions={getToastOptions(resolvedTheme)}
        
      />
      
      <GlobalModals />
      <GlobalBanners />
      <GlobalAlerts />
      <div className="flex min-h-screen  flex-col pb-14 md:pb-0">
      
          <Navbar />
        
          {children}
         
          {state === "connected" ? <SpacesWindow /> : null}
          <BottomNavigation />
        
      </div>
    </>
  );
};

export default Layout;

