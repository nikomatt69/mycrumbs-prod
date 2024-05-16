import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import { APP_NAME } from '@lensshare/data/constants';
import { Card, EmptyState, GridItemEight, GridLayout } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import { loadKeys } from '@lib/xmtp/keys';
import { useClient } from '@xmtp/react-sdk';
import { useEffect } from 'react';
import { useMessagesStore } from 'src/store/non-persisted/useMessagesStore';
import { useAccount, useWalletClient } from 'wagmi';

import StartConversation from './Composer/StartConversation';
import Conversations from './Conversations';
import MessagesList from './MessagesList';
import useResizeObserver from 'use-resize-observer';
import { PAGEVIEW } from '@lensshare/data/tracking';
import { Leafwatch } from '@lib/leafwatch';
import HydrationZustand from '@components/Common/Providers/HydrationZustand';
import { InboxIcon } from '@heroicons/react/24/outline';

const Messages: NextPage = () => {
  const { newConversationAddress, selectedConversation } = useMessagesStore();
  const { initialize, isLoading } = useClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'messages' });
  }, []);

  const initXmtp = async () => {
    if (!address) {
      return;
    }

    let keys = loadKeys(address);
    if (!keys) {
      return;
    }

    return await initialize({
      keys,
      options: { env: 'production' },
      signer: walletClient as any
    });
  };

  useEffect(() => {
    initXmtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className='pt-14'>
    <div className="container mx-auto max-w-screen-xl grow px-0 sm:px-5">
      <div className="grid grid-cols-11">
        <MetaTags title={`Messages • ${APP_NAME}`} />
        <div className="col-span-11 border-x bg-white md:col-span-11 lg:col-span-4 dark:border-gray-700 dark:bg-black">
          <Conversations isClientLoading={isLoading} />
        </div>
        <div className="col-span-11 border-r bg-white md:col-span-11 lg:col-span-7 dark:border-gray-700 dark:bg-black">
          {newConversationAddress ? (
            <StartConversation />
          ) : selectedConversation ? (
            <Card
          className={cn(
            !selectedConversation
              ? 'hidden'
              : 'xs:mx-2 xs:h-[90vh] xs:mx-2 xs:col-span-4 mb-0 flex w-full  flex-col justify-between rounded-xl sm:mx-2 sm:h-[90vh] md:col-span-4 md:h-[90vh] lg:h-[90vh] xl:h-[90vh]'
          )}
        >
            <MessagesList />
            </Card>
          ) : (
            null
          )}
        </div>
      </div>
    </div>
    </Card>
  );
};

export default Messages;
