import type { OG } from '@lensshare/types/misc';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, type FC, useEffect } from 'react';
import { ALLOWED_HTML_HOSTS } from '@lensshare/data/og';
import Embed from './Embed';
import Player from './Player';
import getFavicon from 'src/utils/oembed/getFavicon';


import type { AnyPublication } from '@lensshare/lens';
import Portal from './Portal';

import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import DecentOpenAction from '@components/Publication/LensOpenActions/UnknownModule/Decent 2';
import Frame from './Frame';
import PolymarketWidget from './PolymarketWidget';
import PolymarketOembed from './PolymarketOembed';
import EmptyOembed from './EmptyOembed';

interface OembedProps {
  className?: string;
  onLoad?: (og: OG) => void;
  publication?: AnyPublication;
  url: string;
}

const Oembed: FC<OembedProps> = ({ onLoad, publication, url,className = '', }) => {
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
    favicon: getFavicon(data.url),
    html: data?.html,
    image: data?.image,
    nft: data?.nft,
    site: data?.site,
    title: data?.title,
    url: url as string
  };

  if (!og.title && !og.html) {
    return null;
  }


  if (og.html) {
    return <Player og={og} />;
  }

  return <Embed og={og} publicationId={currentPublication?.id} />;
};

export default Oembed;
