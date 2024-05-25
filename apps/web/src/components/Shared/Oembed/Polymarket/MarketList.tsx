import React from 'react';

interface Market {
  id: string;
  title: string;
}

interface MarketListProps {
  markets: Market[];
}

const MarketList: React.FC<MarketListProps> = ({ markets }) => {
  return (
    <div>
      <div>Market List</div>
      <ul>
        {markets.map((market) => (
          <li key={market.id}>
            <div >{market.title}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MarketList;
