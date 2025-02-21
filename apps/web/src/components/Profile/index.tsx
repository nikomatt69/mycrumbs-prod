import MetaTags from '@components/Common/MetaTags';
import NewPost from '@components/Composer/Post/New';
import {
  APP_NAME,
  HANDLE_PREFIX,
  IS_MAINNET,
  STATIC_ASSETS_URL
} from '@lensshare/data/constants';
import type { Post, Profile } from '@lensshare/lens';
import { FollowModuleType, useProfileQuery } from '@lensshare/lens';
import getProfile from '@lensshare/lib/getProfile';
import { GridItemEight, GridItemFour, GridLayout, Modal } from '@lensshare/ui';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ProfileFeedType } from 'src/enums';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/persisted/useAppStore';
import { useUpdateEffect } from 'usehooks-ts';

import Achievements from './Achievements';
import Cover from './Cover';
import Details from './Details';
import Feed from './Feed';
import FeedType from './FeedType';
import FollowDialog from './FollowDialog';
import ProfilePageShimmer from './Shimmer';
import StoriesRender from '@components/Composer/Stories (1)';
import ProfileBytes from './ProfileBytes';
import { createTrackedSelector } from 'react-tracked';
import { create } from 'zustand';
import getProfileTheme from '@lib/getProfileTheme';
import Stats from './Stats';

export interface ProfileTheme {
  backgroundColour: string;
  bioFont: string;
  publicationFont: string;
}

interface State {
  profileTheme: null | ProfileTheme;
  setProfileTheme: (profileTheme: ProfileTheme) => void;
}

const store = create<State>((set) => ({
  profileTheme: null,
  setProfileTheme: (profileTheme) => set(() => ({ profileTheme }))
}));

export const useProfileThemeStore = createTrackedSelector(store);

const ViewProfile: NextPage = (publication) => {
  const {
    query: { handle, id, type, followIntent },
    isReady
  } = useRouter();
  const { currentProfile } = useAppStore();
  const { profileTheme, setProfileTheme } = useProfileThemeStore();


  const lowerCaseProfileFeedType = [
    ProfileFeedType.Feed.toLowerCase(),
    ProfileFeedType.Replies.toLowerCase(),
    ProfileFeedType.Media.toLowerCase(),
    ProfileFeedType.Collects.toLowerCase(),
    ProfileFeedType.Gallery.toLowerCase(),
    ProfileFeedType.Stats.toLowerCase(),
    ProfileFeedType.Bytes.toLowerCase()
  ];
  const [feedType, setFeedType] = useState(
    type && lowerCaseProfileFeedType.includes(type as string)
      ? type.toString().toUpperCase()
      : ProfileFeedType.Feed
  );

  const { data, loading, error } = useProfileQuery({
    variables: {
      request: {
        ...(id
          ? { forProfileId: id }
          : { forHandle: `${HANDLE_PREFIX}${handle}` })
      }
    },
    onCompleted: (data) => {
      if (data.profile?.id === '0x0d') {
        setProfileTheme({
          backgroundColour: '#f3ecea',
          bioFont: 'audiowide',
          publicationFont: 'audiowide'
        });
      }
    },
    skip: id ? !id : !handle
  });

  const profile = data?.profile as Profile;
  const [following, setFollowing] = useState<boolean | null>(null);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const isFollowedByMe =
    Boolean(currentProfile) &&
    Boolean(profile?.operations.isFollowedByMe.value);

  const followType = profile?.followModule?.type;
  const initState = following === null;
  // profile is not defined until the second render
  if (initState && profile) {
    const canFollow =
      followType !== FollowModuleType.RevertFollowModule && !isFollowedByMe;
    if (followIntent && canFollow) {
      setShowFollowModal(true);
    }
    setFollowing(isFollowedByMe);
  }

  // Profile changes when user selects a new profile from search box
  useUpdateEffect(() => {
    if (profile) {
      setFollowing(null);
    }
  }, [profile]);

  useUpdateEffect(() => {
    if (following) {
      setShowFollowModal(false);
    }
  }, [following]);

  if (!isReady || loading) {
    return <ProfilePageShimmer />;
  }

  if (!data?.profile) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  const theme = getProfileTheme(profileTheme);

  return (
    <span style={{ backgroundColor: theme?.backgroundColour }}>
      <Modal show={showFollowModal} onClose={() => setShowFollowModal(false)}>
        <FollowDialog
          profile={profile as Profile}
          setFollowing={setFollowing}
          setShowFollowModal={setShowFollowModal}
        />
      </Modal>
      <MetaTags
        title={`${getProfile(profile).displayName} (${
          getProfile(profile).slugWithPrefix
        }) • ${APP_NAME}`}
      />
      <Cover
        cover={
          profile?.metadata?.coverPicture?.optimized?.uri ||
          `${STATIC_ASSETS_URL}/patterns/2.svg`
        }
      />
      <GridLayout className="pt-6">
        <GridItemFour>
          <Details
            profile={profile as Profile}
            following={Boolean(following)}
            setFollowing={setFollowing}
          />
        </GridItemFour>
        <GridItemEight className="space-y-5">
          <FeedType setFeedType={setFeedType} feedType={feedType} />
          <StoriesRender
            trigger
            profile={profile as Profile}
            publication={publication as Post}
          />
          <div className="pb-3 text-center">
            {currentProfile && <NewPost />}
          </div>
          {feedType === ProfileFeedType.Feed ||
          feedType === ProfileFeedType.Replies ||
          feedType === ProfileFeedType.Media ||
          feedType === ProfileFeedType.Collects ? (
            <Feed profile={profile as Profile} type={feedType} />
          ) : null}

          {feedType === ProfileFeedType.Stats &&  (
            <Stats profileId={profile?.id.stats} />
          )}
          {feedType === ProfileFeedType.Bytes && (
            <ProfileBytes profileId={profile.id} />
          )}
        </GridItemEight>
      </GridLayout>
    </span>
  );
};

export default ViewProfile;
