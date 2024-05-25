import React from 'react';
import { usePolymarketData } from 'src/hooks/usePolymarketData';


const PolymarketEmbed: React.FC<{ marketId: string }> = ({ marketId }) => {
  const { marketData, loading, error } = usePolymarketData(marketId);

  if (loading) {return <div>Loading...</div>;}
  if (error) {return <div>Error: {error}</div>;}

  return (
    <div>
      <h1>{marketData?.title}</h1>
      <p>{marketData?.description}</p>
      <ul>
        {marketData?.outcomes.map((outcome) => (
          <li key={outcome.name}>{outcome.name}: {outcome.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default PolymarketEmbed;