import React, { useState, useEffect } from 'react';
import { PolymarketClient } from './PolymarketClient';

interface PolymarketWidgetProps {
  eventSlug: string;
}

const PolymarketWidget: React.FC<PolymarketWidgetProps> = ({ eventSlug }) => {
  const [marketData, setMarketData] = useState<string | null>(null);
  const polymarketClient = new PolymarketClient();

  useEffect(() => {
    async function fetchMarketData() {
      const data = await polymarketClient.getMarketData(eventSlug);
      setMarketData(data);
    }
    fetchMarketData();
  }, [eventSlug]);

  if (!marketData) {
    return <div>Loading...</div>;
  }

  return 
};

export default PolymarketWidget;