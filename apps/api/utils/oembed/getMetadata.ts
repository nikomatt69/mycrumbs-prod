import type { OG } from '@lensshare/types/misc';
import { parseHTML } from 'linkedom';

import getProxyUrl from './getProxyUrl';
import generateIframe from './meta/generateIframe';
import getDescription from './meta/getDescription';
import getEmbedUrl from './meta/getEmbedUrl';
import getImage from './meta/getImage';
import getIsLarge from './meta/getIsLarge';
import getSite from './meta/getSite';
import getTitle from './meta/getTitle';
import getFavicon from './getFavicon';
import getNft from './meta/getNft';
import getPortal from './meta/getPortal';
import getPolymarket from './meta/getPolymarket';
import getFrame from './meta/getFrame';
import { HEY_USER_AGENT } from '@lensshare/data/constants';
import axios from 'axios';


const getMetadata = async (url: string): Promise<OG> => {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': HEY_USER_AGENT }
  });
  const { document } = parseHTML(data);
  const image = getImage(document) as string;

  const metadata: OG = {
    description: getDescription(document),
    favicon: getFavicon(url),
    frame: getFrame(document, url),
    html: generateIframe(getEmbedUrl(document), url),
    image: getProxyUrl(image),
    lastIndexedAt: new Date().toISOString(),
    nft: getNft(document, url),
    site: getSite(document),
    polymarket: getPolymarket(document, url),
    title: getTitle(document),
    url
  };

  return metadata;
};

export default getMetadata;


