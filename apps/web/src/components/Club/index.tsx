import type { Club } from '@lensshare/types/club';
import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';

import { APP_NAME, HEY_API_URL, STATIC_ASSETS_URL } from '@lensshare/data/constants';
import { PAGEVIEW } from '@lensshare/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@lensshare/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';


import ClubPageShimmer from './Shimmer';
import { Leafwatch } from '@lib/leafwatch';
import { useAppStore } from 'src/store/persisted/useAppStore';
import getClubApiHeaders from '@lib/getClubApiHeaders';
import Cover from '@components/Profile/Cover';
import Feed from './ClubFeed';
import Details from './ClubDetails';
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import Members from './Members';

const ViewClub: NextPage = () => {
  const {
    isReady,
    pathname,
    query: { handle }
  } = useRouter();
  const { currentProfile } = useAppStore();

  const showMembers = pathname === '/c/[handle]/members';

  useEffect(() => {
    if (isReady) {
      Leafwatch.track(PAGEVIEW, {
        page: 'club',
        subpage: pathname.replace('/c/[handle]', '')
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  const getClub = async (handle: string): Promise<Club | null> => {
    try {
      const response = await axios.post(
        `api/clubs/get`,
        { club_handle: handle, profile_id: currentProfile?.id },
        { headers: getAuthApiHeaders() } 
      );

      return response.data.data.items?.[0];
    } catch {
      return null;
    }
  };

  const {
    data: club,
    error,
    isLoading: clubLoading
  } = useQuery({
    enabled: Boolean(handle),
    queryFn: () => getClub(handle as string),
    queryKey: ['getClub', handle]
  });

  if (!isReady || clubLoading) {
    return <ClubPageShimmer profileList={showMembers} />;
  }

  if (!club) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  return (
    <>
      <MetaTags
        description={club.description}
        title={`${club.name} (/${club.handle}) • ${APP_NAME}`}
      />
      <Cover cover={club.cover || `${STATIC_ASSETS_URL}/patterns/2.svg`} />
      <GridLayout>
        <GridItemFour>
          <Details club={club} />
        </GridItemFour>
        <GridItemEight className="space-y-5">
        {showMembers ? (
            <Members clubId={club.id} handle={club.handle} />
          ) : (
            <Feed handle={club.handle} />
          )}
        </GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewClub;
