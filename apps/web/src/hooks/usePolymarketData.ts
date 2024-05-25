import { PolymarketMarketData } from '@lensshare/types/polymarket';
import { useState, useEffect } from 'react';
import { fetchMarketData } from './polymarketUtils';


export const usePolymarketData = (marketId: string) => {
  const [marketData, setMarketData] = useState<PolymarketMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMarketData(marketId)
      .then(setMarketData)
      .catch(error_ => {
        setError(error_.message);
        console.error(error_);
      })
      .finally(() => setLoading(false));
  }, [marketId]);

  return { marketData, loading, error };
};
