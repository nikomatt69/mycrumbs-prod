import { publicProvider } from 'wagmi/providers/public';
import { ethers } from 'ethers';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { PolymarketAbi } from '@lensshare/abis';

const POLYMARKET_ATTEST_ACTION_MODULE_ADDRESS = '0x0D4936c94188666386B49C19489081029bc2b5Ae';
const ABI = [
  // ABI of the PolymarketAttestActionModule
];

export function useInitializePublicationAction(questionId: string) {
  const { config } = usePrepareContractWrite({
    address: POLYMARKET_ATTEST_ACTION_MODULE_ADDRESS,
    abi: PolymarketAbi,
    functionName: 'initializePublicationAction',
    args: [questionId],
  });
  return useContractWrite(config);
}

export function useProcessOrder(order: any) {
  const { config } = usePrepareContractWrite({
    address: POLYMARKET_ATTEST_ACTION_MODULE_ADDRESS,
    abi: PolymarketAbi,
    functionName: 'processOrder',
    args: [order],
  });
  return useContractWrite(config);
}
