import type { ClubProfile } from '@lensshare/types/club';
import type { FC } from 'react';


import UserProfile from '@components/Shared/UserProfile';

import { ArrowLeftIcon, UsersIcon } from '@heroicons/react/24/outline';

import { type Profile, useProfilesQuery } from '@lensshare/lens';
import { Card, EmptyState, ErrorMessage } from '@lensshare/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Virtuoso } from 'react-virtuoso';
import { useAppStore } from 'src/store/persisted/useAppStore';
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import UserProfileShimmer from '@components/Shared/Shimmer/UserProfileShimmer';


interface MembersProps {
  clubId: string;
  handle: string;
}

const Members: FC<MembersProps> = ({ clubId, handle }) => {
  const { currentProfile } = useAppStore();

  const getClubMembers = async (): Promise<
    | {
        items: ClubProfile[];
        pageInfo: {
          next: null | string;
          prev: null | string;
        };
      }[]
    | null
  > => {
    try {
      const response = await axios.post(
        `api/clubs/members`,
        { id: clubId },
        { headers: getAuthApiHeaders() }
      );

      return response.data.data;
    } catch {
      return null;
    }
  };

  const {
    data: clubMembers,
    error: clubMembersError,
    isLoading: clubMembersLoading
  } = useQuery({
    enabled: Boolean(clubId),
    queryFn: getClubMembers,
    queryKey: ['getClubMembers', clubId]
  });

  const profileIds =
    clubMembers?.flatMap((group) => group.items.map((item) => item.id)) || [];

  const {
    data: lensProfiles,
    error: lensProfilesError,
    loading: lensProfilesLoading
  } = useProfilesQuery({
    skip: !profileIds.length,
    variables: { request: { where: { profileIds } } }
  });

  const members = lensProfiles?.profiles.items || [];

  if (clubMembersLoading || lensProfilesLoading) {
    return <UserProfileShimmer />;
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-8" />}
        message={
          <div>
            <span className="mr-1 font-bold">/{handle}</span>
            <span>doesn’t have any members.</span>
          </div>
        }
      />
    );
  }

  if (clubMembersError || lensProfilesError) {
    return (
      <ErrorMessage
        className="m-5"
        error={clubMembersError || lensProfilesError}
        title="Failed to load members"
      />
    );
  }

  return (
    <Card>
      <div className="flex items-center space-x-3 p-5">
        <Link href={`/c/${handle}`}>
          <ArrowLeftIcon className="size-5" />
        </Link>
        <b className="text-lg">Members</b>
      </div>
      <div className="divider" />
      <Virtuoso
        className="virtual-divider-list-window"
        computeItemKey={(index, member) => `${member.id}-${index}`}
        data={members}
        itemContent={(_, member) => (
          <div className="p-5">
            <UserProfile
            
              profile={member as Profile}
              showBio
              showUserPreview={false}
             
            />
          </div>
        )}
        useWindowScroll
      />
    </Card>
  );
};

export default Members;
