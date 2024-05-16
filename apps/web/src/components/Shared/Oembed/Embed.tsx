import { ATTACHMENT } from '@lensshare/data/constants';
import { PUBLICATION } from '@lensshare/data/tracking';
import imageKit from '@lensshare/lib/imageKit';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import type { OG } from '@lensshare/types/misc';
import { Card, Image } from '@lensshare/ui';
import { Leafwatch } from '@lib/leafwatch';
import Link from 'next/link';
import type { FC } from 'react';

interface EmbedProps {
  og: OG;
  publicationId?: string;
}

const Embed: FC<EmbedProps> = ({ og, publicationId }) => {
  return (
    <div className="mt-4 w-full text-sm md:w-4/6">
      <Link
        href={og.url}
        onClick={(event) => {
          stopEventPropagation(event);
          Leafwatch.track(PUBLICATION.CLICK_OEMBED, {
            ...(publicationId && { publication_id: publicationId }),
            url: og.url
          });
        }}
        rel="noreferrer noopener"
        target={og.url.includes(location.host) ? '_self' : '_blank'}
      >
        <Card className="p-3" forceRounded>
          <div className="flex items-center">
            {og.image ? (
              <Image
                alt="Thumbnail"
                className="h-16 w-16 rounded-xl bg-gray-200"
                height={80}
                onError={({ currentTarget }) => {
                  currentTarget.src = og.image as string;
                }}
                src={imageKit(og.image, ATTACHMENT)}
                width={80}
              />
            ) : null}
            <div className="truncate px-5 py-4">
              <div className="space-y-1">
                {og.title ? (
                  <div className="flex items-center space-x-1.5">
                    {og.favicon ? (
                      <img
                        alt="Favicon"
                        className="h-4 w-4 rounded-full"
                        height={16}
                        src={og.favicon}
                        title={og.site || og.url}
                        width={16}
                      />
                    ) : null}
                    <div className="truncate font-bold">{og.title}</div>
                  </div>
                ) : null}
                {og.description ? (
                  <div className="ld-text-gray-500 line-clamp-1 whitespace-break-spaces">
                    {og.description.replace(/ +/g, ' ')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default Embed;
