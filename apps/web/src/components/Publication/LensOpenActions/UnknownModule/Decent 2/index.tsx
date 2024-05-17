import type { AnyPublication } from '@lensshare/lens';
import type { OG } from '@lensshare/types/misc';

import { useEffect, type FC, useState } from 'react';
import { ALLOWED_HTML_HOSTS } from '@lensshare/data/og';
import FeedEmbed from './FeedEmbed';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { IS_MAINNET } from '@lensshare/data/constants';
import getFavicon from 'src/utils/oembed/getFavicon';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import getPublicationData from '@lensshare/lib/getPublicationData';
import getURLs from '@lensshare/lib/getURLs';
import EmptyOembed from '@components/Shared/Oembed/EmptyOembed';

export const OPEN_ACTION_EMBED_TOOLTIP = 'Open action embedded';
export const OPEN_ACTION_NO_EMBED_TOOLTIP = 'Mint not availabe anymore';

export const openActionCTA = (platformName?: string): string => {
  const name = platformName || '';
  const platform = name.toLowerCase();
  return ['opensea', 'rarible', 'superrare'].includes(platform)
    ? 'Buy'
    : 'Mint';
};
interface DecentOpenActionProps {
  publication: AnyPublication;
}

const DecentOpenAction: FC<DecentOpenActionProps> = ({ publication }) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const { metadata } = targetPublication;
  const filteredContent = getPublicationData(metadata)?.content || '';

  const urls = getURLs(filteredContent);
  const url = urls[0] as string;

  const { data, error, isLoading } = useQuery({
    enabled: Boolean(url),
    queryFn: async () => {
      const response = await axios.get(`/api/oembed`, {
        params: { url }
      });
      return response.data.oembed;
    },
    queryKey: ['getOembed', url],
    refetchOnMount: false
  });

  const [currentPublication, setCurrentPublication] =
    useState<AnyPublication>(publication);

  useEffect(() => {
    if (publication) {
      setCurrentPublication(publication);
    }
  }, [publication]);

  const og: OG = {
    description: data?.description,
    favicon: data?.url ? getFavicon(data.url) : null,
    html: data?.html,
    image: data?.image,
    nft: data?.nft,
    site: data?.site,
    title: data?.title,
    url: url
  };

  const canPerformDecentAction: boolean = Boolean(
    targetPublication &&
      targetPublication.openActionModules.some(
        (module) =>
          module.contract.address === VerifiedOpenActionModules.DecentNFT
      )
  );

  const embedDecentOpenAction: boolean = IS_MAINNET && canPerformDecentAction;

  if (isLoading || error || !data) {
    if (error) {
      return null;
    }

    const hostname = new URL(url).hostname.replace('www.', '');

    if (ALLOWED_HTML_HOSTS.includes(hostname)) {
      return <div className="shimmer mt-4 h-[415px] w-full rounded-xl" />;
    }

    return <EmptyOembed url={url} />;
  }

  if (!og.title && !og.html && !og.nft && !embedDecentOpenAction) {
    return null;
  }

  if (!embedDecentOpenAction) {
    return null;
  }

  return <FeedEmbed og={og} publication={currentPublication} />;
};

export default DecentOpenAction;