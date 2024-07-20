import type { OG } from '@lensshare/types/misc';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, type FC, useEffect } from 'react';
import { ALLOWED_HTML_HOSTS } from '@lensshare/data/og';
import Embed from './Embed';
import Player from './Player';
import getFavicon from 'src/utils/oembed/getFavicon';


import type { AnyPublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';
import Portal from './Portal';

import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import DecentOpenAction from '@components/Publication/LensOpenActions/UnknownModule/Decent 2';
import Frame from './Frame';
import PolymarketWidget from './PolymarketWidget';
import PolymarketOembed from './PolymarketOembed';
import EmptyOembed from './EmptyOembed';
import Polyframe from './Polyframe';
import Market from '@components/Publication/LensOpenActions/UnknownModule/Polymarket';

interface OembedProps {
  onLoad?: (og: OG) => void;
  publication?: AnyPublication;
  url: string;
}

const Oembed: FC<OembedProps> = ({ onLoad, publication, url }) => {
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
    useState<AnyPublication>();

  useEffect(() => {
    if (publication) {
      setCurrentPublication(publication);
    }
  }, [publication]);

  useEffect(() => {
    if (onLoad) {
      onLoad(data as OG);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  const og: OG = {
    description: data?.description,
    favicon: data?.url ? getFavicon(data.url) : '',
    frame: data?.frame,
    html: data?.html,
    image: data?.image,
    nft: data?.nft,
    site: data?.site,
    title: data?.title,
    url: url as string,
    polymarket: data?.polymarket
  };
  const isPolymarket = og.site?.toLowerCase().includes('polymarket');
  if (!og.title && !og.html && !isPolymarket && !og.frame) {
    return null;
  }

  if (isPolymarket) {
    return <Market module={module as unknown as UnknownOpenActionModuleSettings} conditionId={data.url} publication={currentPublication?.id} />;
  }

  if (og.html) {
    return <Player og={og} />;
  }
  if (og.frame) {
    return <Frame frame={og.frame} publicationId={currentPublication?.id} />;
  }
  if (og.polymarket) {
    return <Polyframe frame={og.polymarket} publicationId={currentPublication?.id} />;
  }

  return <Embed og={og} publicationId={currentPublication?.id} />;
};

export default Oembed;
