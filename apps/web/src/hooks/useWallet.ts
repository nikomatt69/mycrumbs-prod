import { useState } from "react";
import { connectWallet } from "../lib/wallet";

export const useWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      const walletData = await connectWallet();
      setWallet(walletData);
    } catch (err) {
      setError(err.message);
    }
  };

  return { wallet, connect, error };
};
