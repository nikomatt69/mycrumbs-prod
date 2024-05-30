import type { UnknownOpenActionModuleSettings } from '@lensshare/lens';
import type { EasPoll as TPoll } from '@lensshare/types/hey';
import type { FC } from 'react';

import Choices from '@components/Publication/Poll/eas/Choices';
import Wrapper from '@components/Shared/Embed/Wrapper';
import { HEY_API_URL } from '@lensshare/data/constants';
import { Spinner } from '@lensshare/ui';
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface EasPollProps {
  module: UnknownOpenActionModuleSettings;
  publicationId: string;
}

const EasPoll: FC<EasPollProps> = ({ module, publicationId }) => {
  const fetchPoll = async (): Promise<null | TPoll> => {
    try {
      const response = await axios.get(`/api/polls/eas/get`, {
        headers: { ...getAuthApiHeaders(), 'X-Skip-Cache': true },
        params: { publicationId }
      });
      const { data } = response;

      return data?.result;
    } catch {
      return null;
    }
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryFn: fetchPoll,
    queryKey: ['fetchPoll', publicationId]
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

  if (!data?.options?.length || error) {
    return null;
  }

  return <Choices module={module} poll={data} refetch={refetch} />;
};

export default EasPoll;
