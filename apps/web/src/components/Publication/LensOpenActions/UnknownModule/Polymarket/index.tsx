import Head from 'next/head';
import MarketEmbed from './MarketEmbed';
import PublicationBody from '@components/Publication/PublicationBody';
import { AnyPublication, MirrorablePublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';
interface MarketEmbedProps {
  conditionId: string;
  module: UnknownOpenActionModuleSettings;
  publication?: AnyPublication | MirrorablePublication;
}


const Market: React.FC<MarketEmbedProps> = ({ conditionId ,publication }) => {


  return (
    <div>
      <Head>
        <title>MyCrumbs</title>
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold">Polymarket Integration</h1>
        <MarketEmbed 
        module={module as unknown as UnknownOpenActionModuleSettings} publication={publication} conditionId={"0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917" as string} />
      </main>
    </div>
  );
  }
  export default Market