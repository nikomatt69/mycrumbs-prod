
import React, { useState } from 'react';

import MarketDetails from './MarketDetails';
import OutcomeList from './OutcomeList';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Input from './Input';
import Button from './Button';
import { validateMarketId } from '@lib/validateMarketId';
import { useMarketData } from '@lib/useMarketData';


const PolymarketWidget: React.FC = () => {
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
      {error && <ErrorMessage message={error} />}
      {marketData && (
        <>
          <MarketDetails marketData={marketData} />
          <OutcomeList outcomes={marketData.outcomes} />
        </>
      )}
    </div>
  );
};

export default PolymarketWidget;
    