import { useState } from 'react';
import { createMarketOrder, placeOrder } from '../lib/polymarket';

export const useMarketData = (market: any) => {
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOrder = async () => {
    try {
      if (market) {
        const tokenId = market.tokens.find((token: any) => token.outcome === 'Yes').token_id;
        const order = await createMarketOrder(tokenId, amount);
        await placeOrder(order);
        setSuccess('Order placed successfully!');
      }
    } catch (err) {
      setError('Failed to place order.');
    }
  };

  return { amount, setAmount, handleOrder, error, success };
};