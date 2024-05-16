import type {
  AnyPublication,
  UnknownOpenActionModuleSettings
} from '@lensshare/lens';
import type { FC } from 'react';

import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';

import SwapOpenAction from './UnknownModule/Swap';
import PolymarketEditor from './UnknownModule/Polymarket';
import PolymarketOembed from '@components/Shared/Oembed/PolymarketOembed';
import PolymarketWidget from '@components/Shared/Oembed/PolymarketWidget';
import DecentOpenAction from './UnknownModule/Decent 2';
import RentableBillboardOpenAction from './UnknownModule/RentableBillboard';

interface OpenActionOnBodyProps {
  publication: AnyPublication;
}

const OpenActionOnBody: FC<OpenActionOnBodyProps> = ({ publication }) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;

  const module = targetPublication.openActionModules.find(
    (module) => module.contract.address === VerifiedOpenActionModules.Swap
  );

  if (!module) {
    return null;
  }

  return (
    <div className="mt-3">
      {module.contract.address === VerifiedOpenActionModules.Swap && (
        <SwapOpenAction
          module={module as UnknownOpenActionModuleSettings}
          publication={targetPublication}
        />
      )}
      {module.contract.address === VerifiedOpenActionModules.Polymarket && (
        <PolymarketWidget
          marketId={targetPublication.id}
          module={module as UnknownOpenActionModuleSettings}
          publication={targetPublication}
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
    </div>
  );
};

export default OpenActionOnBody;
