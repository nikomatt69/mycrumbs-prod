import React, { FC } from 'react';
import { useAccount } from 'wagmi';
import MarketEmbed from './MarketEmbed';
import { AnyPublication, MirrorablePublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';

interface PolymarketModuleProps {
  conditionId: string;
  module: UnknownOpenActionModuleSettings;
  publication?: AnyPublication | MirrorablePublication;
}

const PolymarketModule: FC<PolymarketModuleProps> = ({ conditionId, module, publication }) => {
  const { address } = useAccount();

  return (
    <div>
      <MarketEmbed conditionId={conditionId} module={module} publication={publication} />
    </div>
  );
};

export default PolymarketModule;