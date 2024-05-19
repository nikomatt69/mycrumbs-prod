import type { AnyPublication, MirrorablePublication } from '@lensshare/lens';
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
import DecentOpenActionShimmer from './Decent Open Action Shimmer';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import { Card } from '@lensshare/ui';

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
  publication: MirrorablePublication;
}

const DecentOpenAction: FC<DecentOpenActionProps> = ({ publication }) => {
  const { metadata } = publication;
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

  const og = {
    description: data?.description,
    image: data?.image,
    nft: data?.nft,
    title: data?.title,
    url: url
  } as OG;

  const canPerformDecentAction = Boolean(
    publication.openActionModules.some(
      (module) =>
        module.contract.address === VerifiedOpenActionModules.DecentNFT
    )
  );

  const embedDecentOpenAction = IS_MAINNET && canPerformDecentAction;

  if (isLoading) {
    return (
      <Card forceRounded onClick={stopEventPropagation}>
        <div className="shimmer h-[350px] max-h-[350px] rounded-t-xl" />
        <DecentOpenActionShimmer />
      </Card>
    );
  }

  if (error || !data || !embedDecentOpenAction || !og.nft) {
    return null;
  }

  return <FeedEmbed og={og} publication={publication} />;
};

export default DecentOpenAction;