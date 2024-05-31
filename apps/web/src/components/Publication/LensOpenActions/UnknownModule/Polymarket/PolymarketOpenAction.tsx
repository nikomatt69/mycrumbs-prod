import Head from 'next/head';
import PolymarketModule from './PolymarketModule';
import { AnyPublication, MirrorablePublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';

interface PolymarketProps {
  conditionId: string;
  module: UnknownOpenActionModuleSettings;
  publication?: AnyPublication | MirrorablePublication;
}

const Polymarket: React.FC<PolymarketProps> = ({ conditionId, module, publication }) => {
  return (
    <div>
      <Head>
        <title>Polymarket Integration</title>
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold">Polymarket Integration</h1>
        <PolymarketModule conditionId={conditionId} module={module} publication={publication} />
      </main>
    </div>
  );
};

export default Polymarket;