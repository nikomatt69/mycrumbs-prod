import { useState, useEffect } from 'react';
import { PolymarketClient } from 'src/components/Publication/LensOpenActions/UnknownModule/Polymarket/PolymarketClient';

export const usePolymarket = (conditionId: string) => {
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const client = new PolymarketClient();
        const marketData = await client.getMarketBySlug(conditionId);
        setMarket(marketData);
      } catch (error_) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [conditionId]);

  return { market, loading, error };
};