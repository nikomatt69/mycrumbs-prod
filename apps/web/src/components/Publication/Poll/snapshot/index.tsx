import type { SnapshotPoll as TPoll } from '@lensshare/types/hey';
import type { FC } from 'react';

import { HEY_API_URL } from '@lensshare/data/constants';
import { Spinner } from '@lensshare/ui';
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import Wrapper from '../../../Shared/Embed/Wrapper';
import Choices from './Choices';

interface SnapshotProps {
  id: string;
}

const SnapshotPoll: FC<SnapshotProps> = ({ id }) => {
  const fetchPoll = async (): Promise<null | TPoll> => {
    try {
      const response = await axios.get(`/api/polls/snapshot/get`, {
        headers: { ...getAuthApiHeaders(), 'X-Skip-Cache': true },
        params: { id }
      });
      const { data } = response;

      return data?.result;
    } catch {
      return null;
    }
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryFn: fetchPoll,
    queryKey: ['fetchPoll', id]
  });

  if (isLoading) {
    // TODO: Add skeleton loader here
    return (
      <Wrapper>
        <div className="flex items-center justify-center">
          <Spinner size="xs" />
        </div>
      </Wrapper>
    );
  }

  if (!data?.id || error) {
    return null;
  }

  return <Choices poll={data} refetch={refetch} />;
};

export default SnapshotPoll;
