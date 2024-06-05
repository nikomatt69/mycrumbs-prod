import MetaTags from '@components/Common/MetaTags';

import FeedFocusType from '@components/Shared/FeedFocusType';
import Footer from '@components/Shared/Footer';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { APP_NAME } from '@lensshare/data/constants';
import type { PublicationMetadataMainFocusType } from '@lensshare/lens';
import { ExplorePublicationsOrderByType } from '@lensshare/lens';
import { GridItemEight, GridItemFour, GridLayout } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { useAppStore } from 'src/store/persisted/useAppStore';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';

import Feed from './Feed';
import MirrorOutline from '@components/Icons/MirrorOutline';
import LatestBytes from '@components/Bytes/LatestBytes';
import HorizantalScroller from './HorizantalScroller';
import SpacesWindow from '@components/Common/SpacesWindow/SpacesWindow';
import { useRoom } from '@huddle01/react/hooks';
import FireOutline from '@components/Icons/FireOutline';
import CollectOutline from '@components/Icons/CollectOutline';

const Explore: NextPage = () => {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { currentProfile } = useAppStore();
  const [focus, setFocus] = useState<PublicationMetadataMainFocusType>();
  const { state } = useRoom();
  const tabs = [
    {
      icon: <FireOutline className="h-5 w-5 text-blue-700" />,
      type: ExplorePublicationsOrderByType.LensCurated
    },

    {
      icon: (
        <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-blue-700" />
      ),
      type: ExplorePublicationsOrderByType.TopCommented
    },

    {
      icon: <MirrorOutline className="h-5 w-5 text-blue-700" />,
      type: ExplorePublicationsOrderByType.TopMirrored
    },
    {
      icon: <CollectOutline className="h-5 w-5 text-blue-700" />,
      type: ExplorePublicationsOrderByType.TopCollectedOpenAction
    }
  ];

  return (
    <GridLayout>
      <MetaTags
        title={`Explore • ${APP_NAME}`}
        description={`Explore top commented, collected and latest publications in the ${APP_NAME}.`}
      />
      <GridItemEight className="space-y-5 ">
        <div className="flex flex-col">
          <HorizantalScroller
            sectionRef={sectionRef}
            heading="Trending Bytes"
          />
          <div
            ref={sectionRef}
            className="no-scrollbar laptop:pt-6 relative flex items-start space-x-4 overflow-x-auto overflow-y-hidden scroll-smooth rounded-xl pt-4"
          >
            <LatestBytes />
          </div>
        </div>

        <TabGroup
          defaultIndex={Number(router.query.tab)}
          onChange={(index) => {
            router.replace(
              { query: { ...router.query, tab: index } },
              undefined,
              { shallow: true }
            );
          }}
        >
          <TabList className="divider mx-auto py-2 space-x-3">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.type}
                defaultChecked={index === 1}
                className={({ selected }) =>
                  cn(
                    {
                      'border-brand-500  border-b-2 !text-black dark:!text-white':
                        selected
                    },
                    'lt-text-gray-500 px-4 py-2 text-xs font-medium outline-none sm:text-sm'
                  )
                }
              >
                {tab.icon}
              </Tab>
            ))}
          </TabList>
          <FeedFocusType  focus={focus} setFocus={setFocus} />
          <TabPanels className={'py-2'}>
            {tabs.map((tab) => (
              <TabPanel className={'p-2'} key={tab.type}>
                <Feed  focus={focus} feedType={tab.type} />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </GridItemEight>
      <GridItemFour className='pt-2'>
        
      {state === "connected" ? <SpacesWindow /> : null}
        <Footer />
      </GridItemFour>
    </GridLayout>
  );
};

export default Explore;
