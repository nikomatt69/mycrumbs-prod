import Feed from '@components/Comment/Feed';
import PublicationActions from '@components/Publication/Actions';
import type { AnyPublication, PrimaryPublication } from '@lensshare/lens';
import type { FC } from 'react';
import React from 'react';

import getPublicationData from '@lensshare/lib/getPublicationData';
import UserProfile from '@components/Shared/UserProfile';
import { useAppStore } from 'src/store/persisted/useAppStore';
import NewPublication from '@components/Composer/NewPublication';

type Props = {
  audio: PrimaryPublication;
};

const Details: FC<Props> = ({ audio }) => {
  const metadata = getPublicationData(audio.metadata);
  const { currentProfile } = useAppStore();
  return (
    <div className="px-4 py-10 lg:px-0">
      <div className="p-2">
        {currentProfile ? (
          <NewPublication publication={audio as AnyPublication} isNew />
        ) : null}
      </div>
      <div className="mt-6">
        <Feed publication={audio} />
      </div>
    </div>
  );
};

export default Details;
