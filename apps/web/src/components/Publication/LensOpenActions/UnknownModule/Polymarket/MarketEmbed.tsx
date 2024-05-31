import React, { useEffect } from 'react';
import { useMarketStore} from 'src/store/persisted/useMarketStore'
import MarketCard from './MarketCard';
import { usePolymarket } from 'src/hooks/usePolymarketHook';
import { AnyPublication, MirrorablePublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';



interface MarketEmbedProps {
  conditionId: string;
  module: UnknownOpenActionModuleSettings;
  publication?: AnyPublication | MirrorablePublication;
}

const MarketEmbed: React.FC<MarketEmbedProps> = ({ conditionId, publication }) => {
  const { market, loading, error, setMarket, setLoading, setError } = useMarketStore();
  const { market: SessionPoly, loading: polyLoading, error: polyError } = usePolymarket(conditionId);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const marketData = await SessionPoly();
        setMarket(marketData);
      } catch (error_) {
        setError('Failed to load market data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [conditionId, setMarket, setLoading, setError]);

  if (loading || polyLoading) {return <p>Loading market data...</p>;}
  if (error || polyError) {return <p className="text-red-500">{error || polyError}</p>;}

  return <MarketCard market={market} />;
};

export default MarketEmbed;