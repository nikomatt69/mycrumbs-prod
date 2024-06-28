
import type { ActionData , UIData} from 'nft-openaction-kit';
import type { Dispatch, FC, SetStateAction } from 'react';

import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  Squares2X2Icon,
  UserIcon
} from '@heroicons/react/24/outline';

import {
  getPermit2Allowance,
  permit2SignatureAmount,
  signPermitSignature,
  updateWrapperParams
} from '@lib/permit2';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import useActOnUnknownOpenAction from 'src/hooks/useActOnUnknownOpenAction';
import { useTransactionStatus } from 'src/hooks/useIndexStatus';

import { Address, parseAbi } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

import CurrencySelector from './CurrencySelector';
import DecentAction from './DecentAction';
import StepperApprovals from './StepperApprovals';
import { MirrorablePublication, Profile, UnknownOpenActionModuleSettings, useDefaultProfileQuery } from '@lensshare/lens';
import { AllowedToken } from '@lensshare/types/hey';
import { Nft, OptimisticTransaction } from '@lensshare/types/misc';
import getRedstonePrice from '@lib/getRedstonePrice';

import { CHAIN_ID, DEFAULT_DECENT_OA_TOKEN, MAX_UINT256, PERMIT_2_ADDRESS, ZERO_ADDRESS } from '@lensshare/data/constants';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { HelpTooltip, Modal , Image} from '@lensshare/ui';
import getProfile from '@lensshare/lib/getProfile';
import sanitizeDStorageUrl from '@lensshare/lib/sanitizeDStorageUrl';
import truncateByWords from '@lensshare/lib/truncateByWords';
import { CHAIN } from '@lib/costantChain';

import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import getNftChainInfo from '@lensshare/lib/getNftChainInfo';
import getNftChainId from '@lensshare/lib/nft/getNftChainId';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import FeesDisclosure from './FeesDisclosure';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokensStore';
import { useRatesStore } from 'src/store/persisted/useRatesStore';

import { OptmisticPublicationType } from '@lensshare/types/enums';
import cn from '@lensshare/ui/cn';
import { useQuery } from '@tanstack/react-query';
import { useNftOpenActionStore } from './FeedEmbed';
import QuantityConfig from './QuantityConfig';
import { useNftOaCurrencyStore } from 'src/store/persisted/useNftOaCurrencyStore';
import formatAddress from '@lensshare/lib/formatAddress';

const generateOptimisticNftMintOA = ({
  txId
}: {
  txId: string;
}): OptimisticTransaction => {
  return {
    txId,
    type: OptmisticPublicationType.NftMintOA
  };
};

interface Permit2Data {
  deadline: number;
  nonce: number;
  signature: string;
}

interface DecentOpenActionModuleProps {
  actionData?: ActionData;
  loadingActionData: boolean;
  module: UnknownOpenActionModuleSettings;
  nft: Nft;
  publication: MirrorablePublication;
  uiData?: null | UIData;
  
}

const DecentOpenActionModule: FC<DecentOpenActionModuleProps> = ({
  actionData,
  loadingActionData,
  nft,
  module,
  publication,
  uiData
}) => {
  const {
    activeOpenActionModal,
    selectedQuantity,
    setActiveOpenActionModal,
    setSelectedQuantity
  } = useNftOpenActionStore();
  const { selectedNftOaCurrency, setSelectedNftOaCurrency } =
    useNftOaCurrencyStore();
  const { addTransaction } = useTransactionStore();
  const { allowedTokens } = useAllowedTokensStore();
  const { fiatRates } = useRatesStore();

  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showLongDescription, setShowLongDescription] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [isModalCollapsed, setIsModalCollapsed] = useState(false);
  const [permit2Allowed, setPermit2Allowed] = useState(false);
  const [permit2Data, setPermit2Data] = useState<Permit2Data | undefined>();
  const [isPermit2Loading, setIsPermit2Loading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [prevImageUrl, setPrevImageUrl] = useState('');
  const [isImageLoading, setImageLoading] = useState(false);
  const chainIdStr = uiData?.dstChainId.toString();
  const chainInfo = getNftChainInfo(getNftChainId(chainIdStr ?? ''));
  const nftChainInfo = {
    logo: chainInfo.logo,
    name: chainInfo.name
  };
  const platformName = uiData?.platformName || '';
  const nftName = uiData?.nftName || '';

  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const handleWrongNetwork = useHandleWrongNetwork();

  const { actOnUnknownOpenAction, isLoading, txId } = useActOnUnknownOpenAction(
    {
      onSuccess: () => {
        setPermit2Data(undefined);
        setIsApproved(false);
        setSelectedQuantity(1);
        setActiveOpenActionModal(null);
      },
      signlessApproved: true,
      successToast: 'NFT has been minted successfully!'
    }
  );

  const { data: creatorProfileData } = useDefaultProfileQuery({
    skip: !uiData?.nftCreatorAddress,
    variables: {
      request: { for: uiData?.nftCreatorAddress }
    }
  });

  useEffect(() => {
    if (txId) {
      addTransaction(generateOptimisticNftMintOA({ txId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txId]);

  useEffect(() => {
    if (nft?.mediaUrl) {
      const newImageUrl = sanitizeDStorageUrl(nft.mediaUrl);
      if (newImageUrl !== currentImageUrl) {
        setImageLoading(true);
        setPrevImageUrl(currentImageUrl);
        setCurrentImageUrl(newImageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft]);

  const usdPrice =
    fiatRates?.find(
      (rate) => rate.address === (selectedNftOaCurrency)?.toLowerCase()
    )?.fiat || 0;

  // fees are always priced in MATIC
  const maticUsdPrice =
    fiatRates?.find((rate) => rate.symbol === 'WMATIC')?.fiat || 0;

  const creatorProfileExists =
    creatorProfileData && creatorProfileData.defaultProfile;
  const creatorAddress = uiData?.nftCreatorAddress || ZERO_ADDRESS;

  const totalAmount = !!actionData?.actArgumentsFormatted?.paymentToken?.amount
    ? BigInt(actionData?.actArgumentsFormatted?.paymentToken?.amount) *
      BigInt(selectedQuantity)
    : BigInt(0);

  // Convert totalAmount to a number with decimals
  const getTokenDetails = (currencyAddress: Address) => {
    return (
      allowedTokens?.find((t) => t.contractAddress === currencyAddress) ||
      (DEFAULT_DECENT_OA_TOKEN as AllowedToken)
    );
  };
  const { decimals } = getTokenDetails(selectedNftOaCurrency);
  const formattedTotalAmount = Number(totalAmount) / Math.pow(10, decimals);

  const bridgeFee = actionData
    ? (actionData.actArgumentsFormatted?.bridgeFeeNative * maticUsdPrice) /
      usdPrice
    : 0;

  const formattedTotalFees = bridgeFee + formattedTotalAmount * 0.05;
  const formattedNftSchema = nft.schema === 'erc1155' ? 'ERC-1155' : 'ERC-721';

  const amount = formattedTotalAmount || 0;
  const assetAddress = selectedNftOaCurrency;

  const fetchPermit2Allowance = async () => {
    setPermit2Data(undefined);
    if (address && Boolean(assetAddress)) {
      const allowanceData = await getPermit2Allowance({
        owner: address as `0x${string}`,
        spender: PERMIT_2_ADDRESS,
        token: assetAddress as `0x${string}`
      });
      const approvedAmount = allowanceData;
      if (Number(approvedAmount) > amount) {
        setPermit2Allowed(true);
      } else {
        setPermit2Allowed(false);
      }
    }

    return;
  };

  useQuery({
    queryFn: fetchPermit2Allowance,
    queryKey: ['fetchPermit2Allowance', amount, assetAddress, address]
  });

  const approvePermit2 = async () => {
    if (walletClient) {
      setIsPermit2Loading(true);
      try {
        if (handleWrongNetwork()) {
            return;
          }
        const hash = await walletClient.writeContract({
          abi: parseAbi(['function approve(address, uint256) returns (bool)']),
          address: assetAddress as `0x${string}`,
          args: [PERMIT_2_ADDRESS, MAX_UINT256],
          functionName: 'approve'
        });
        const allowanceData = await getPermit2Allowance({
          hash,
          owner: address as `0x${string}`,
          spender: PERMIT_2_ADDRESS,
          token: assetAddress as `0x${string}`
        });
        const approvedAmount = allowanceData;

        if (Number(approvedAmount) > amount) {
          setPermit2Allowed(true);
        } else {
          setPermit2Allowed(false);
        }

        return toast.success('Approved Permit2');
      } catch (error) {
        return toast.error('Failed to approve Permit2');
      } finally {
        setIsPermit2Loading(false);
      }
    }
  };

  const approveOA = async () => {
    if (walletClient && actionData) {
      setIsApprovalLoading(true);
      try {
        const signatureAmount = permit2SignatureAmount({
          chainId: actionData.uiData?.dstChainId,
          data: actionData.actArguments?.actionModuleData
        });
        if (handleWrongNetwork()) {
            return;
          }
        const permit2Signature = await signPermitSignature(
          walletClient,
          signatureAmount,
          assetAddress as `0x${string}`
        );
        setPermit2Data({
          deadline: permit2Signature.deadline,
          nonce: permit2Signature.nonce,
          signature: permit2Signature.signature
        });
        setIsModalCollapsed(false);
        setIsApproved(true);

        return toast.success('Approved module');
      } catch (error) {
        return toast.error('Failed to approve module');
      } finally {
        setIsApprovalLoading(false);
      }
    }
  };

  const act = async () => {
    if (actionData && permit2Data) {
      try {
        const updatedCalldata = await updateWrapperParams({
          chainId: actionData.uiData?.dstChainId,
          data: actionData.actArguments?.actionModuleData,
          deadline: BigInt(permit2Data.deadline),
          nonce: BigInt(permit2Data.nonce),
          signature: permit2Data.signature as `0x${string}`
        });

        return await actOnUnknownOpenAction({
          address: VerifiedOpenActionModules.DecentNFT as `0x${string}`,
          data: updatedCalldata,
          publicationId: publication.id,
          referrers: actionData.actArguments?.referrerProfileIds?.map((id) => ({
            profileId: '0x' + id.toString(16).padStart(2, '0')
          }))
        });
      } catch (error) {
        return toast.error('Failed to mint NFT');
      }
    }
  };

  const handleImageLoaded = () => {
    setImageLoading(false);
    setPrevImageUrl('');
  };

  return (
    <Modal
      icon={
        showCurrencySelector ? (
          <button
            onClick={(e) => {
              stopEventPropagation(e);
              setShowCurrencySelector(false);
            }}
          >
            <ChevronLeftIcon className="mt-0.5 h-4 w-4 stroke-black" />
          </button>
        ) : isModalCollapsed ? (
          <button
            onClick={(e) => {
              stopEventPropagation(e);
              setIsModalCollapsed(false);
            }}
          >
            <ChevronLeftIcon className="mt-0.5 h-4 w-4 stroke-black" />
          </button>
        ) : null
      }
      onClose={() => {
        setIsModalCollapsed(false);
        setSelectedQuantity(1);
        setActiveOpenActionModal(null);
      }}
      show={activeOpenActionModal === publication.id}
      title={
        showCurrencySelector
          ? 'Select token'
          : uiData?.platformName
            ? `Mint on ${uiData?.platformName}`
            : 'Mint NFT'
      }
    >
      {showCurrencySelector ? (
        <CurrencySelector
          onSelectCurrency={( currency) => {
            setSelectedNftOaCurrency(currency);
            setShowCurrencySelector(false);
          }}
        />
      ) : isModalCollapsed ? (
        <StepperApprovals
          approveOA={() => approveOA()}
          approvePermit2={() => approvePermit2()}
          isApprovalLoading={isApprovalLoading}
          isPermit2Loading={isPermit2Loading}
          nftDetails={{
            creator: getProfile(creatorProfileData?.defaultProfile as Profile)
              .slug,
              name: uiData?.nftName || '',
              price: formattedTotalAmount.toFixed(4),
              schema: formattedNftSchema,
              uri: sanitizeDStorageUrl(uiData?.nftUri)
          }}
          selectedCurrencySymbol={getTokenDetails(selectedNftOaCurrency).symbol}
          step={!permit2Allowed ? 'Permit2' : 'Allowance'}
        />
      ) : (
        <>
          <div className="space-y-2 p-5">
            <div>
              <b className="text-xl">{nftName}</b>
              {creatorProfileData ? (
                <p className="ld-text-gray-500">
                  by{' '}
                  {creatorProfileExists
                    ? getProfile(creatorProfileData.defaultProfile as Profile)
                        .slug
                    : creatorAddress
                    ? formatAddress(creatorAddress)
                      : '...'}
                </p>
              ) : (
                <p className="ld-text-gray-500">{`By ${formatAddress(creatorAddress)}`}</p>
              )}
            </div>
            <div className="pt-2">
              <div className="relative">
                {isImageLoading && prevImageUrl && (
                  <Image
                    alt="Loading..."
                    className="absolute aspect-[1.5] max-h-[350px] w-full rounded-xl object-contain"
                    src={prevImageUrl}
                  />
                )}
                <div className="relative h-[350px] max-h-[350px] w-full overflow-hidden rounded-xl">
                  <Image
                    alt={`Blurred background for ${nft.collectionName}`}
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg filter"
                    src={currentImageUrl}
                  />
                  <Image
                    alt={nft.collectionName}
                    className={cn(
                      'relative aspect-[1.5] h-full w-full object-contain transition-opacity duration-500',
                      isImageLoading
                        ? 'invisible opacity-0'
                        : 'visible opacity-100'
                    )}
                    onLoad={handleImageLoaded}
                    src={currentImageUrl}
                  />
                </div>
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>Loading...</div>
                  </div>
                )}
              </div>
              {nft.description && (
                <p className="my-5">
                  {showLongDescription
                    ? nft.description
                    : truncateByWords(nft.description, 30)}
                  {nft.description.trim().split(/\s+/).length > 30 ? (
                    <button
                      className="ld-text-gray-500 ml-1"
                      onClick={(e) => {
                        stopEventPropagation(e);
                        setShowLongDescription((v) => !v);
                      }}
                    >
                      {showLongDescription ? 'Show less' : 'read more'}
                    </button>
                  ) : null}
                </p>
              )}
            </div>
            <div className="ld-text-gray-500 flex items-center justify-between text-base">
              <div className="flex items-center space-x-2">
                <Squares2X2Icon className="h-4 w-4" />
                <p className="text-sm">{formattedNftSchema}</p>
              </div>
              {nft.mintCount && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <p className="text-sm">{nft.mintCount} minted</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                <Link
                  className="text-sm"
                  href={nft.mintUrl || nft.sourceUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Open in {platformName}
                </Link>
              </div>
            </div>
            {nftChainInfo ? (
              <div className="flex items-center justify-start space-x-2">
                <img
                  alt={nftChainInfo?.name || 'NFT Chain'}
                  className="h-4 w-4 rounded-full"
                  height={16}
                  src={nftChainInfo?.logo}
                  width={16}
                />
                <p className="ld-text-gray-500 text-sm">{nftChainInfo?.name}</p>
              </div>
            ) : null}
          </div>
          {nft.schema === 'erc1155' ? <QuantityConfig /> : null}
          <div className="space-y-4 p-4 pt-2">
            <div>
              <div className="ld-text-gray-500 flex items-center hidden justify-between space-y-0.5">
                <span className="space-x-1">Price</span>
                <div>
                  {(formattedTotalAmount - formattedTotalFees).toFixed(4)}{' '}
                  {getTokenDetails(selectedNftOaCurrency).symbol}
                </div>
              </div>
              <FeesDisclosure
                actionData={actionData}
                bridgeFee={bridgeFee}
                formattedTotalAmount={formattedTotalAmount}
                formattedTotalFees={formattedTotalFees}
                tokenSymbol={getTokenDetails(selectedNftOaCurrency).symbol}
              />
              <div className="mt-4 flex items-start justify-between space-y-0.5 text-xl text-gray-600 dark:text-gray-100">
                <span className="flex items-baseline justify-start space-x-1">
                  Total Price
                  <span className="flex-col items-baseline ml-2 text-xs justify-start space-x-1">
                ( fees included )
                </span>
                </span>
                
                <div className="flex flex-col items-end">
                  <p>
                    {formattedTotalAmount.toFixed(4)}{' '}
                    {getTokenDetails(selectedNftOaCurrency).symbol}
                  </p>
                  
                </div>
              </div>
            </div>
            {selectedNftOaCurrency ? (
              <DecentAction
                act={
                  permit2Allowed && Boolean(permit2Data)
                    ? act
                    : () => setIsModalCollapsed(!isModalCollapsed)
                }
                className="w-full justify-center"
                isLoading={isLoading}
                isLoadingActionData={loadingActionData}
                isReadyToMint={isApproved && permit2Allowed}
                moduleAmount={{
                  asset: {
                    contract: {
                      address: selectedNftOaCurrency,
                      chainId: CHAIN_ID
                    },
                    decimals: getTokenDetails(selectedNftOaCurrency).decimals,
                    name: getTokenDetails(selectedNftOaCurrency).name,
                    symbol: getTokenDetails(selectedNftOaCurrency).symbol
                  },
                  value: formattedTotalAmount.toFixed(4)
                }}
                uiData={uiData}
              />
            ) : null}
            <div className="flex w-full items-center justify-center">
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DecentOpenActionModule;