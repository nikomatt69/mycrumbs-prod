import { ethers } from "ethers";

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      return { provider, signer };
    } catch (error) {
      throw new Error("User rejected the request.");
    }
  } else {
    throw new Error("No crypto wallet found. Please install it.");
  }
};
