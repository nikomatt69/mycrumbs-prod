import type { FC } from 'react';
import { useState } from 'react';
import { ClockIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Bars3BottomLeftIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Button, Card, Input, Modal, Tooltip } from '@lensshare/ui';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { useOpenActionStore } from 'src/store/non-persisted/useOpenActionStore';
import { useAccount, useConnect, useWalletClient } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { ClobClient, getContractConfig } from '@polymarket/clob-client';
import { conditionalTokenAbi, usdcAbi } from '@lensshare/abis';
import walletClient from '@lib/walletClient';
import { polygon } from 'viem/chains';
import plur from 'plur';
import { CHAIN_ID } from '@lensshare/data/constants';
import { Address, WalletClient } from 'viem';
import PolymarketEmbed from '@components/Shared/Oembed/Polymarket/PolymarketEmbed';

const chain = polygon;
const clobApiUrl = "https://clob.polymarket.com/";
const config = getContractConfig(CHAIN_ID);

const mintableUsdcAbi = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Market: FC = () => {
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { address, isConnected } = useAccount();
  const { data: signer } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [polymarketLink, setPolymarketLink] = useState('');
  const [tokenID, setTokenID] = useState('');
  const { marketConfig, resetMarketConfig, setMarketConfig, setShowMarketEditor } = usePublicationStore();
  const [showMarketLengthModal, setShowMarketLengthModal] = useState(false);
  const { setOpenAction } = useOpenActionStore();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const extractTokenID = (link: string) => {
    const match = link.match(/polymarket\.com\/event\/([^/]+)/);
    return match ? match[1] : '';
  };

  const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const link = event.target.value;
    if (!link.includes('polymarket.com')) {
      setErrorMessage('Invalid Polymarket link');
      return;
    }
    setPolymarketLink(link);
    const extractedTokenID = extractTokenID(link);
    if (extractedTokenID) {
      setTokenID(extractedTokenID);
      setErrorMessage('');
    } else {
      setErrorMessage('Unable to extract Token ID from the link');
    }
  };

  const notify = (message: string, type: 'error' | 'success') => {
    type === 'error' ? setErrorMessage(message) : setSuccessMessage(message);
    setTimeout(() => {
      setErrorMessage('');
      setSuccessMessage('');
    }, 5000);
  };

  const handleAction = async (action: () => Promise<void>, successMsg: string, errorMsg: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      await action();
      notify(successMsg, 'success');
    } catch (error) {
      notify(`${errorMsg}: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!signer || !tokenID) {return;}
    await handleAction(
      async () => {
        const clobClient = new ClobClient(clobApiUrl, CHAIN_ID, signer as any);
        const creds = await clobClient.deriveApiKey(0);
        const l2ClobClient = new ClobClient(clobApiUrl, CHAIN_ID, signer as any, creds);
        const order = await l2ClobClient.createMarketBuyOrder({ tokenID, amount: 10, price: 0.5 });
        await l2ClobClient.postOrder(order);
      },
      'Order created successfully',
      'Error creating order'
    );
  };

  const mintUsdc = async () => {
    if (!signer || !address) {return;}
    await handleAction(
      async () => {
        await signer.writeContract({
          address: config.collateral as Address,
          abi: mintableUsdcAbi,
          functionName: "mint",
          args: [address, BigInt("1000000000000")],
        });
      },
      'USDC minted successfully',
      'Error minting USDC'
    );
  };

  const approveSpend = async () => {
    if (!signer) {return;}
    await handleAction(
      async () => {
        const approvalPromises = [
          signer.writeContract({
            address: config.collateral as Address,
            abi: usdcAbi,
            functionName: "approve",
            args: [config.conditionalTokens],
          }),
          signer.writeContract({
            address: config.collateral as Address,
            abi: usdcAbi,
            functionName: "approve",
            args: [config.exchange],
          }),
          signer.writeContract({
            address: config.conditionalTokens as Address,
            abi: conditionalTokenAbi,
            functionName: "setApprovalForAll",
            args: [config.exchange, true],
          }),
        ];
        await Promise.all(approvalPromises);
      },
      'Spend approved successfully',
      'Error approving spend'
    );
  };

  return (
    <Card className="m-5 px-5 py-3" forceRounded>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <Bars3BottomLeftIcon className="text-brand-500 w-4 h-4" />
          <b>Polymarket</b>
        </div>
        <div className="flex items-center space-x-3">
          <Tooltip content="Delete" placement="top">
            <button
              className="flex"
              onClick={() => {
                resetMarketConfig();
                setShowMarketEditor(false);
              }}
              type="button"
            >
              <XCircleIcon className="w-5 h-5 text-red-400" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3">
        <Input
          label="Polymarket Link"
          placeholder="Enter Polymarket.com link"
          value={polymarketLink}
          onChange={handleLinkChange}
        />
        <Input
          label="Token ID"
          value={tokenID}
          disabled
        />
        <img
          src={polymarketLink}
        />
      </div>
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      {successMessage && <div className="text-green-500 mt-2">{successMessage}</div>}
      <div className="flex items-center space-x-2 mt-3">
        <Button
          className="btn btn-secondary btn-sm font-light text-brand hover:border-transparent bg-base-100 hover:bg-secondary"
          onClick={mintUsdc}
          disabled={loading}
        >
          {loading ? "Processing..." : "Mint USDC"}
        </Button>
        <Button
          className="btn btn-secondary btn-sm font-light text-brand hover:border-transparent bg-base-100 hover:bg-secondary"
          onClick={approveSpend}
          disabled={loading}
        >
          {loading ? "Processing..." : "Approve Spend"}
        </Button>
        <Button
          className="btn btn-secondary btn-sm font-light text-brand hover:border-transparent bg-base-100 hover:bg-secondary"
          onClick={createOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : "Create Order"}
        </Button>
      </div>
    </Card>
  );
};

export default Market;