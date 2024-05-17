import MetaTags from '@components/Common/MetaTags';
import { APP_NAME } from '@lensshare/data/constants';
import { Localstorage } from '@lensshare/data/storage';
import {
  Button,
  Card,
  GridItemEight,
  GridItemFour,
  GridLayout
} from '@lensshare/ui';
import type { NextPage } from 'next';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/persisted/useAppStore';

import SettingsSidebar from '../Sidebar';

import Custom404 from 'src/pages/404';
import { usePushChatStore } from 'src/store/persisted/usePushChatStore';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import { PAGEVIEW } from '@lensshare/data/tracking';
import { Leafwatch } from '@lib/leafwatch';
import { useEffect } from 'react';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
const CleanupSettings: NextPage = () => {
  const { currentProfile } = useAppStore();

  const { reset } = useTransactionStore();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'settings', subpage: 'cleanup' });
  }, []);

  if (!currentProfile) {
    return <NotLoggedIn />;
  }

  const cleanup = (key: string) => {
    localStorage.removeItem(key);
    toast.success(`Cleared ${key}`);
  };

  return (
    <GridLayout>
      <MetaTags title={`Cleanup settings • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsSidebar />
      </GridItemFour>
      <GridItemEight>
        <Card className="p-5">
          <div className="space-y-5">
            <div className="text-lg font-bold">Cleanup Localstorage</div>
            <p>
              If you stuck with some issues, you can try to clean up the
              localstorage. This will remove all the data stored in your
              browser.
            </p>
          </div>
          <div className="divider my-5" />
         
          
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <b>Optimistic actions</b>
                <div className="ld-text-gray-500 text-xs font-bold">
                  Clean your posts, comments, follows, and other actions that
                  are still in the queue
                </div>
              </div>
              <Button onClick={reset}>Cleanup</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <b>Timeline settings</b>
                <div className="lt-text-gray-500 text-xs font-bold">
                  Clean your timeline filter settings
                </div>
              </div>
              <Button onClick={() => cleanup(Localstorage.TimelineStore)}>
                Cleanup
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <b>Direct message keys</b>
                <div className="lt-text-gray-500 text-xs font-bold">
                  Clean your DM encryption key
                </div>
              </div>
              <Button
                onClick={() => {
                  cleanup(Localstorage.MessagesStore),
                   
                    toast.success(`Cleared DM keys`);
                }}
              >
                Cleanup
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <b>Feature flags cache</b>
                <div className="lt-text-gray-500 text-xs font-bold">
                  Clean your feature flags cache
                </div>
              </div>
              <Button onClick={() => cleanup(Localstorage.FeaturesCache)}>
                Cleanup
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <b>Leafwatch store</b>
                <div className="lt-text-gray-500 text-xs font-bold">
                  Clean your leafwatch store
                </div>
              </div>
              <Button onClick={() => cleanup(Localstorage.LeafwatchStore)}>
                Cleanup
              </Button>

          </div>

        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default CleanupSettings;
