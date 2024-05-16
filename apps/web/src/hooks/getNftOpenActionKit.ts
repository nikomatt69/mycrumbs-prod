import { NftOpenActionKit } from 'nft-openaction-kit';
const NEXT_PUBLIC_DECENT_API_KEY="4d019b3d2209196b20dd207f8c19c8a9"
const NEXT_PUBLIC_OPENSEA_API_KEY="ee7460014fda4f58804f25c29a27df35"
const NEXT_PUBLIC_RARIBLE_API_KEY="4ad887e1-fe57-47e9-b078-9c35f37c4c13"
const getNftOpenActionKit = () => {
  return new NftOpenActionKit({
    decentApiKey: NEXT_PUBLIC_DECENT_API_KEY || '',
    openSeaApiKey: NEXT_PUBLIC_OPENSEA_API_KEY || '',
    raribleApiKey: NEXT_PUBLIC_RARIBLE_API_KEY || ''
  });
};

export default getNftOpenActionKit;
