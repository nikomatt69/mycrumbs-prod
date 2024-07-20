import React, { useState } from 'react';
import { PolymarketClient } from './PolymarketClient';

interface OrderFormProps {
  marketId: string;
  apiKey: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ marketId, apiKey }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const polymarketClient = new PolymarketClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const order = {
      marketId,
      amount: parseFloat(amount),
      // Add other necessary order fields here
    };
    try {
      await polymarketClient.placeOrder(order, apiKey);
    } catch (error_) {
      setError('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default OrderForm;