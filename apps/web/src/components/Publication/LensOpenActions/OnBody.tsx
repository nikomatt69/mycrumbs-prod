import type {
  AnyPublication,
  MirrorablePublication,
  UnknownOpenActionModuleSettings
} from '@lensshare/lens';
import type { FC } from 'react';

import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';

import SwapOpenAction from './UnknownModule/Swap';

import PolymarketOembed from '@components/Shared/Oembed/PolymarketOembed';
import PolymarketWidget from '@components/Shared/Oembed/PolymarketWidget';
import DecentOpenAction from './UnknownModule/Decent 2';
import RentableBillboardOpenAction from './UnknownModule/RentableBillboard';
import MarketEmbed from './UnknownModule/Polymarket/MarketEmbed';

import EasPoll from '../Poll/eas';
import Polymarket from './UnknownModule/Polymarket';


interface OpenActionOnBodyProps {
  publication: MirrorablePublication;
}

const OpenActionOnBody: FC<OpenActionOnBodyProps> = ({ publication }) => {

    const module = publication.openActionModules.find(
      (module) =>
        module.contract.address === VerifiedOpenActionModules.Swap ||
        module.contract.address === VerifiedOpenActionModules.RentableBillboard ||
        module.contract.address === VerifiedOpenActionModules.DecentNFT ||
        module.contract.address === VerifiedOpenActionModules.Polymarket ||
        module.contract.address === VerifiedOpenActionModules.Poll
    );
  
    if (!module) {
      return null;
    }
    
    
    return (
      <div className="mt-3">
        {module.contract.address === VerifiedOpenActionModules.Swap && (
          <SwapOpenAction
            module={module as UnknownOpenActionModuleSettings}
            publication={publication}
          />
        )}
        {
          module.contract.address ===
            VerifiedOpenActionModules.RentableBillboard && (
            <RentableBillboardOpenAction
              module={module as UnknownOpenActionModuleSettings}
              publication={publication}
            />
          )}
        {module.contract.address === VerifiedOpenActionModules.DecentNFT && (
          <DecentOpenAction publication={publication} />
        )}
        {module.contract.address === VerifiedOpenActionModules.Polymarket && (
          <Polymarket conditionId={publication.metadata.id as  string } module={module as UnknownOpenActionModuleSettings} publication={publication} />
        )}
        
      </div>
    );
  };
  
  export default OpenActionOnBody;