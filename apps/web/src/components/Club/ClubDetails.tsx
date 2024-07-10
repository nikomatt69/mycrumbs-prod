import type { Club } from '@lensshare/types/club';
import type { FC } from 'react';


import Markup from '@components/Shared/Markup';
import Slug from '@components/Shared/Slug';

import { Image, LightBox } from '@lensshare/ui';
import Link from 'next/link';
import { useState } from 'react';
import getMentions from '@lensshare/lib/getMentions';
import humanize from '@lensshare/lib/humanize';
import Join from './Join';

interface DetailsProps {
  club: Club;
}

const Details: FC<DetailsProps> = ({ club }) => {
  const [expandedImage, setExpandedImage] = useState<null | string>(null);

  return (
    <div className="mb-4 space-y-5 px-5 sm:px-0">
      <div className="relative -mt-24 size-32 sm:-mt-32 sm:size-52">
        <Image
          alt={club.handle}
          className="size-32 cursor-pointer rounded-xl bg-gray-200 ring-8 ring-gray-50 sm:size-52 dark:bg-gray-700 dark:ring-black"
          height={128}
          onClick={() => setExpandedImage(club.logo)}
          src={club.logo}
          width={128}
        />
        <LightBox
          onClose={() => setExpandedImage(null)}
          show={Boolean(expandedImage)}
          url={expandedImage}
        />
      </div>
      <div className="space-y-1 py-2">
        <div className="truncate text-2xl font-bold">{club.name}</div>
        <Slug className="text-sm sm:text-base" prefix="c/" slug={club.handle} />
      </div>
      {club.description ? (
        <div className="markup linkify text-md mr-0 break-words sm:mr-10">
          <Markup mentions={getMentions(club.description)}>
            {club.description}
          </Markup>
        </div>
      ) : null}
      <div className="space-y-5">
        <Link
          className="text-left outline-offset-4"
          href={`/c/${club.handle}/members`}
        >
          <div className="text-xl">{humanize(club.totalMembers)}</div>
          <div className="ld-text-gray-500">Members</div>
        </Link>
        <Join id={club.id} />
      </div>
    </div>
  );
};

export default Details;
