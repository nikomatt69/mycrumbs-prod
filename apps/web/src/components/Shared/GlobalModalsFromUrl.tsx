import type { FC } from 'react';


import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useAppStore } from 'src/store/persisted/useAppStore';

import { useSignupStore } from './Auth/Signup';
import { Leafwatch } from '@lib/leafwatch';
import { AUTH } from '@lensshare/data/tracking';

const GlobalModalsFromUrl: FC = () => {
  const { isReady, push, query } = useRouter();
  const { currentProfile } = useAppStore();
  const { setShowAuthModal } = useGlobalModalStateStore();
  const { setScreen } = useSignupStore();

  // Trigger Signup modal
  useEffect(() => {
    if (isReady && query?.signup && !currentProfile?.id) {
      setScreen('choose');
      setShowAuthModal(true, 'signup');
      Leafwatch.track(AUTH.CONNECT_WALLET);

      // remove query param
      push({ pathname: '/' }, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return null;
};

export default GlobalModalsFromUrl;
