import SmallUserProfile from '@components/Shared/SmallUserProfile';
import UserProfile from '@components/Shared/UserProfile';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AnyPublication, FeedItem } from '@lensshare/lens';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import cn from '@lensshare/ui/cn';
import type { FC } from 'react';

import PublicationMenu from './Actions/Menu';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';

interface PublicationHeaderProps {
  publication: AnyPublication;
  feedItem?: FeedItem;
  quoted?: boolean;
  isNew?: boolean;
}

const PublicationHeader: FC<PublicationHeaderProps> = ({
  publication,
  feedItem,
  quoted = false,
  isNew = false
}) => {
  const { setQuotedPublication } = usePublicationStore();

  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;
  const firstComment = feedItem?.comments?.[0];
  const rootPublication = feedItem
    ? firstComment
      ? firstComment
      : feedItem?.root
    : targetPublication;
  const profile = feedItem ? rootPublication.by : targetPublication.by;
  const timestamp = feedItem
    ? rootPublication.createdAt
    : targetPublication.createdAt;

  return (
    <div
      className={cn(
        quoted ? 'pb-2' : 'pb-4',
        'relative flex justify-between space-x-1.5'
      )}
    >
      <span
        className="max-w-full"
        onClick={stopEventPropagation}
        aria-hidden="true"
      >
        {quoted ? (
          <SmallUserProfile
            profile={profile}
            timestamp={timestamp}
            linkToProfile
          />
        ) : (
          <UserProfile profile={profile} timestamp={timestamp} />
        )}
      </span>
      <div className="!-mr-[7px] flex items-center space-x-1">
        {!publication.isHidden && !quoted ? (
          <PublicationMenu publication={targetPublication} />
        ) :  (
          <div className="w-[30px] h-[30px]" />
        )}
        {quoted && isNew ? (
          <button
            className="rounded-full border p-1.5 hover:bg-gray-300/20"
            onClick={(event) => {
              stopEventPropagation(event);
              setQuotedPublication(null);
            }}
            aria-label="Remove Quote"
            type='reset'
          >
            <XMarkIcon className="lt-text-gray-500 w-[15px] sm:w-[18px]" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PublicationHeader;
