import { PolymarketMarketData } from '@lensshare/types/polymarket';
import { useState, useEffect } from 'react';

export const useMarketData = (marketId: string) => {
  const [marketData, setMarketData] = useState<PolymarketMarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`/api/getMarketData?marketId=${marketId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        const data: PolymarketMarketData = await response.json();
        setMarketData(data);
        setError(null);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [marketId]);

  return { marketData, loading, error };
};
