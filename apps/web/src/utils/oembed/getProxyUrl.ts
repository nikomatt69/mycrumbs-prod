const directUrls = [
  'zora.co/api/thumbnail', // Zora
  'social-images.lu.ma', // Lu.ma
  'drips.network' // Drips
];
const IMAGEKIT_URL = 'https://ik.imagekit.io/seasgram';

const getProxyUrl = (url: string) => {
  if (!url) {
    return null;
  }

  
  const height =  400 ;
  const width = 400 ;

  return `${IMAGEKIT_URL}/tr:di-placeholder.webp,h-${height},w-${width}/${url}`;
};


export default getProxyUrl;