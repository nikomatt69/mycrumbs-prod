
const IMAGEKIT_URL = 'https://ik.imagekit.io/seasgram';

const directUrls = [
  'zora.co/api/thumbnail', // Zora
  'social-images.lu.ma', // Lu.ma
  'drips.network', // Drips,
'poly-prod-6m862b8v2.polymarket.dev/api/og/', // Polymarket

];

const getProxyUrl = (url: string) => {
  if (!url) {
    return null;
  }

  const isDirect = directUrls.some((directUrl) => url.includes(directUrl));

  if (isDirect) {
    return url;
  }
  const height =  400 ;
  const width = 400 ;

  return `${IMAGEKIT_URL}/tr:di-placeholder.webp,h-${height},w-${width}/${url}`;
};

export default getProxyUrl;
