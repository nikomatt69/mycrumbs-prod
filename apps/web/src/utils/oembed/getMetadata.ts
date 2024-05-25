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
import getPortal from './meta/getPortal';
import getNft from './meta/getNft';

import getPolymarket from './meta/getPolymarket';


const getMetadata = async (url: string): Promise<OG> => {
  const { html } = await fetch(url, {
    headers: { 'User-Agent': 'MyCrumbs' }
  }).then(async (res) => ({
    html: await res.text()
  }));

  const { document } = parseHTML(html);
  const image = getImage(document) as string;

  const metadata: OG = {
    description: getDescription(document),
    favicon: getFavicon(url),
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

