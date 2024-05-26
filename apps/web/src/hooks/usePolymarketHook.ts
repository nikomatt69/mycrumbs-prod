import { useState, useEffect } from 'react';
import { getMarket } from '../lib/polymarket';

export const usePolymarket = (conditionId: string) => {
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const marketData = await getMarket(conditionId);
        setMarket(marketData);
      } catch (err) {
        setError('Failed to load market data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [conditionId]);

  return { market, loading, error , conditionId };
};