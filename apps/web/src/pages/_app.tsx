import '../styles.css';
import Providers from '@components/Common/Providers';

import type { AppProps } from 'next/app';
import { Suspense, useEffect, useState } from 'react';
import Loading from '@components/Shared/Loading';
import { heyFont } from '@lib/heyFont';

const App = ({ Component, pageProps }: AppProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <Loading />;
  }
  return (
    <Suspense fallback={<Loading />}>
      <Providers>
        <style jsx global>{`
          body {
            font-family: ${heyFont.style.fontFamily};
          }
        `}</style>
        <Component {...pageProps} />
      </Providers>
    </Suspense>
  );
};

export default App;
