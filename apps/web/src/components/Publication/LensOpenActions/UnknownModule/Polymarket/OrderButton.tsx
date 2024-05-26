import React from "react";

interface OrderButtonProps {
  amount: number;
  setAmount: (amount: number) => void;
  handleOrder: () => void;
  success: string | null;
  error: string | null;
}

const OrderButton: React.FC<OrderButtonProps> = ({ amount, setAmount, handleOrder, success, error }) => {
  return (
    <div className="mt-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="p-2 border rounded"
        placeholder="Enter amount"
        min="0"
      />
      <button
        onClick={handleOrder}
        className="ml-2 p-2 bg-blue-500 text-white rounded"
      >
        Place Order
      </button>
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default OrderButton;
