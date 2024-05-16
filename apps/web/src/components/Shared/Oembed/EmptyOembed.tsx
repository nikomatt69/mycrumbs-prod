import type { FC } from 'react';

import { LinkIcon } from '@heroicons/react/24/outline';
import { PLACEHOLDER_IMAGE } from '@lensshare/data/constants';
import { Card, Image } from '@lensshare/ui';

interface EmptyOembedProps {
  url: string;
}

const EmptyOembed: FC<EmptyOembedProps> = ({ url }) => {
  return (
    <div className="mt-4 w-full text-sm md:w-4/6">
      <Card className="p-3" forceRounded>
        <div className="flex items-center">
          <Image
            alt="Thumbnail"
            className="h-16 w-16 rounded-xl bg-gray-200 md:[h-20 w-20]"
            height={80}
            src={PLACEHOLDER_IMAGE}
            width={80}
          />
          <div className="truncate px-5 py-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <LinkIcon className="ld-text-gray-500 h-4 w-4" />
                <div className="max-w-sm truncate font-bold">{url}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmptyOembed;
