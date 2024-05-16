import type { FC } from 'react';

import { useVerifyQuery } from '@lensshare/lens';
import { hydrateAuthTokens } from 'src/store/persisted/useAuthStore';
import getCurrentSession from '@lib/getCurrentSession';

// This will refresh the access token if it's expired
const LensAuthProvider: FC = () => {
  const { id } = getCurrentSession();
  const { accessToken } = hydrateAuthTokens();

  useVerifyQuery({
    pollInterval: 10000,
    skip: !id,
    variables: { request: { accessToken } }
  });

  return null;
};

export default LensAuthProvider;
