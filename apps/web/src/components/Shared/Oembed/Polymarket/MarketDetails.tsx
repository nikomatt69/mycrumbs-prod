
import { PolymarketMarketData } from '@lensshare/types/polymarket';
import React from 'react';


interface MarketDetailsProps {
  marketData: PolymarketMarketData;
}

const MarketDetails: React.FC<MarketDetailsProps> = ({ marketData }) => {
  return (
    <div>
      <h3 className="text-lg font-bold">Market: {marketData.title}</h3>
      <p>{marketData.description}</p>
      <img src={marketData.imageUrl} alt="Market Cover" className="w-full h-64 object-cover" />
    </div>
  );
};

export default MarketDetails;
    