import React, { FC, useState } from 'react';
import PolymarketWidget from './PolymarketWidget';
import type { OG } from '@lensshare/types/misc';
import { useMarketData } from '@lib/useMarketData';
import { MirrorablePublication } from '@lensshare/lens';

interface PolymarketOembedProps {
  og: OG;
  publicationId?: string;
}

const PolymarketOembed: FC<PolymarketOembedProps> = ({ og, publicationId }) => {
  const [inputMarketId, setInputMarketId] = useState<string>('');
  const [currentMarketId, setCurrentMarketId] = useState<string>('');
  
  const { marketData, loading, error } = useMarketData(currentMarketId);
  if (!currentMarketId) {
    return <div>Invalid market ID</div>;
  }

  return (
    <div className="polymarket-oembed">
      <h2>{og.title}</h2>
      <PolymarketWidget publicationId={publicationId}  />
    </div>
  );
};

export default PolymarketOembed;