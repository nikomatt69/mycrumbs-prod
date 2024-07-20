
import React, { FC, useState } from 'react';

import { validateMarketId } from '@lib/validateMarketId';
import { useMarketData } from '@lib/useMarketData';
import { Button, ErrorMessage, Input } from '@lensshare/ui';
import LoadingSpinner from './Polymarket/LoadingSpinner';
import MarketDetails from './Polymarket/MarketDetails';
import OutcomeList from './Polymarket/OutcomeList';
import { MirrorablePublication } from '@lensshare/lens';
import { PolymarketMarketData } from '@lensshare/types/polymarket';
import { OG } from '@lensshare/types/misc';

interface PolymarketWidgetProps {
  og: OG;
  publicationId?: string;
}

const PolymarketWidget: FC<PolymarketWidgetProps> = ({ publicationId ,og}) => {
  const [inputMarketId, setInputMarketId] = useState<string>('');
  const [currentMarketId, setCurrentMarketId] = useState<string>('');
  const { marketData, loading, error } = useMarketData(currentMarketId);

  const handleSearch = () => {
    if (validateMarketId(inputMarketId)) {
      setCurrentMarketId(inputMarketId);
    } else {
      alert('Invalid Market ID');
    }
  };

  return (
    <div className="p-4 shadow-lg rounded-lg bg-white">
      <div className="mb-4">
        <Input
          value={inputMarketId}
          onChange={(e) => setInputMarketId(e.target.value)}
          placeholder="Enter Market ID"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage  />}
      {og.polymarket && (
        <>
        <img 
           src={og.polymarket.imageUrl}
           className='h-20 w-20'
           />
          <MarketDetails marketData={og.polymarket} />
          <OutcomeList outcomes={og.polymarket.outcomes} />
        </>
      )}
    </div>
  );
};

export default PolymarketWidget;
    