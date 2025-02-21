
import type { FC } from 'react';

import Loader from '@components/Shared/Loader';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { HEY_API_URL, IS_MAINNET } from '@lensshare/data/constants';
import { GlobalProfileStats } from '@lensshare/types/hey';
import { Card, ErrorMessage } from '@lensshare/ui';
import NumberedStat from '@components/Staff/UI/NumberedStat';

interface ProfileStatsProps {
  profileId: string;
}

const ProfileStats: FC<ProfileStatsProps> = ({ profileId }) => {
  const getProfileStats = async (): Promise<GlobalProfileStats | null> => {
    try {
      const response = await axios.get(
        `/api/stats/stats/profile/all`,
        { params: { id: profileId } }
      );

      return response.data?.result || null;
    } catch {
      return null;
    }
  };

  const { data, error, isLoading } = useQuery({
    enabled: IS_MAINNET,
    queryFn: getProfileStats,
    queryKey: ['getProfileStats', profileId]
  });

  if (isLoading) {
    return (
      <Card>
        <Loader message="Loading profile stats..." />
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load profile stats" />;
  }

  return (
    <Card>
      <div title="Global Profile Stats" />
      <div className="m-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <NumberedStat
          count={data.total_publications.toString()}
          name="Publications"
        />
        <NumberedStat count={data.total_posts.toString()} name="Posts" />
        <NumberedStat count={data.total_comments.toString()} name="Comments" />
        <NumberedStat count={data.total_mirrors.toString()} name="Mirrors" />
        <NumberedStat count={data.total_quotes.toString()} name="Quotes" />
        <NumberedStat count={data.total_reacted.toString()} name="Likes" />
        <NumberedStat
          count={data.total_reactions.toString()}
          name="Likes Received"
        />
        <NumberedStat count={data.total_collects.toString()} name="Collects" />
        <NumberedStat
          count={data.total_acted.toString()}
          name="Actions on Open Actions"
        />
        <NumberedStat
          count={data.total_notifications.toString()}
          name="Notifications Received"
        />
      </div>
    </Card>
  );
};

export default ProfileStats;
