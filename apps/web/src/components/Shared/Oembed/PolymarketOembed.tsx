import React, { useEffect } from 'react';
import { useMarketStore} from 'src/store/persisted/useMarketStore'

import { usePolymarket } from 'src/hooks/usePolymarketHook';
import { AnyPublication, MirrorablePublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';
import MarketCard from '@components/Publication/LensOpenActions/UnknownModule/Polymarket/MarketCard';



interface MarketEmbedProps {
  conditionId: string;
  module: UnknownOpenActionModuleSettings;
  publication?: AnyPublication | MirrorablePublication;
}

const MarketEmbed: React.FC<MarketEmbedProps> = ({ conditionId ,publication }) => {
  const { market, loading, error, setMarket, setLoading, setError } = useMarketStore();
const {market :SessionPoly} = usePolymarket(conditionId)
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const marketData = SessionPoly();
        setMarket(marketData);
      } catch (error_) {
        setError('Failed to load market data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [conditionId, setMarket, setLoading, setError]);

  if (loading) {return <p>Loading market data...</p>;}
  if (error) {return <p className="text-red-500">{error}</p>;}

  return <MarketCard market={market} />;
};

export default MarketEmbed;