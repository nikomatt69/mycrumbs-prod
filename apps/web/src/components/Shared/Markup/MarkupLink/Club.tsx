import type { MarkupLinkProps } from '@lensshare/types/misc';
import type { FC } from 'react';


import { CLUB_HANDLE_PREFIX } from '@lensshare/data/constants';
import { PUBLICATION } from '@lensshare/data/tracking';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import Link from 'next/link';
import { Leafwatch } from '@lib/leafwatch';
import toast from 'react-hot-toast';

const Club: FC<MarkupLinkProps> = ({ title }) => {
  if (!title) {
    return null;
  }

  const club = title.slice(1).replace(CLUB_HANDLE_PREFIX, '').toLowerCase();
  const clubHandle = `/${club}`;

  return (
    <Link
      className="cursor-pointer outline-none focus:underline"
      href={`/c/${club}`}
      onClick={(event) => {
        stopEventPropagation(event);
        Leafwatch.track(PUBLICATION.CLICK_MENTION, { club: clubHandle });
      }}
    >
      {clubHandle}
    </Link>
  );
};

export default Club;