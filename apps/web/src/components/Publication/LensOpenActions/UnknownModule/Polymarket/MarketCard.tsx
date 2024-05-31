import React from 'react';
import OrderButton from './OrderButton';

import { useOrderStore } from 'src/store/persisted/useOrderStore';
import { createMarketOrder, placeOrder } from '@lib/polymarket';

interface MarketCardProps {
  market: any;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const { amount, setAmount, success, error, setSuccess, setError } = useOrderStore();

  const handleOrder = async () => {
    try {
      if (market) {
        const tokenId = market.tokens.find((token: any) => token.outcome === 'Yes').token_id;
        const order = await createMarketOrder(tokenId, amount);
        await placeOrder(order);
        setSuccess('Order placed successfully!');
      }
    } catch (error_) {
      setError('Failed to place order.');
    }
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-bold">{market.question}</h2>
      <img src={market.image || '/images/placeholder.png'} alt="Market" className="w-full h-64 object-cover mt-2" />
      <OrderButton 
        amount={amount}
        setAmount={setAmount}
        handleOrder={handleOrder}
        error={error}
        success={success}
      />
    </div>
  );
};

export default MarketCard;