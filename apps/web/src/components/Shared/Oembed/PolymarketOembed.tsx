import React, { FC, useState, useEffect } from 'react';
import { OG } from '@lensshare/types/misc';

import { MirrorablePublication } from '@lensshare/lens';
import PolymarketEmbed from './Polymarket/PolymarketEmbed';
import { Outcome } from '@lensshare/types/polymarket';
import { useMarketData } from '@lib/useMarketData';

interface PolymarketOembedProps {
  og: OG;
  publicationId?: string;
}

const PolymarketOembed: FC<PolymarketOembedProps> = ({ og, publicationId }) => {
  const [inputMarketId, setInputMarketId] = useState<string>('');
  const [currentMarketId, setCurrentMarketId] = useState<string>('');

  const { marketData, loading, error } = useMarketData(currentMarketId);

  useEffect(() => {
    if (inputMarketId) {
      setCurrentMarketId(inputMarketId);
    }
  }, [inputMarketId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMarketId(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentMarketId(inputMarketId);
  };

  return (
    <div className="polymarket-oembed">
      <h2>{og.title}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMarketId}
          onChange={handleInputChange}
          placeholder="Enter Market ID"
        />
        <button type="submit">Load Market</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {marketData && (
        <div>
          <h3>{marketData.title}</h3>
          <p>{marketData.description}</p>
          <ul>
            {marketData.outcomes.map((outcome: Outcome) => (
              <li key={outcome.name}>{outcome.name}: {outcome.price}</li>
            ))}
          </ul>
        </div>
      )}
      {currentMarketId && <PolymarketEmbed marketId={currentMarketId} />}
    </div>
  );
};

export default PolymarketOembed;