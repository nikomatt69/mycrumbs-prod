
import type { FC } from 'react';

import LoginButton from '@components/Shared/Navbar/LoginButton';

import { LinkIcon } from '@heroicons/react/24/outline';
import { Button, Spinner } from '@lensshare/ui';

import Link from 'next/link';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { Amount } from '@lensshare/lens';
import cn from '@lensshare/ui/cn';
import MetaDetails from '@components/StaffTools/Panels/MetaDetails';
import { openActionCTA } from '.';
import { UIData } from 'nft-openaction-kit';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import { LAYERZEROSCAN_URL, POLYGONSCAN_URL } from '@lensshare/data/constants';

interface DecentActionProps {
  act: () => void;
  allowanceLoading?: boolean;
  className?: string;
  isLoading?: boolean;
  isLoadingActionData?: boolean;
  isReadyToMint?: boolean;
  moduleAmount?: Amount;
  uiData?: null | UIData;
}

const DecentAction: FC<DecentActionProps> = ({
  act,
  allowanceLoading,
  className = '',
  isLoading = false,
  isLoadingActionData = false,
  isReadyToMint,
  moduleAmount,
  uiData
}) => {
  const { address } = useAccount();

  const amount = parseInt(moduleAmount?.value || '0');
  const assetAddress = moduleAmount?.asset?.contract.address;
  const assetDecimals = moduleAmount?.asset?.decimals || 18;
  const assetSymbol = moduleAmount?.asset?.symbol;

  const { data: balanceData } = useBalance({
    address,
   
    token: assetAddress
  });

  let hasAmount = false;
  if (
    balanceData &&
    parseFloat(formatUnits(balanceData.value, assetDecimals)) < amount
  ) {
    hasAmount = false;
  } else {
    hasAmount = true;
  }

  if (!address) {
    return (
      <div className="w-full">
        <LoginButton isBig isFullWidth title="Login to Mint" />
      </div>
    );
  }

  if (allowanceLoading) {
    return (
      <div className={cn('shimmer h-[38px] w-28 rounded-full', className)} />
    );
  }

  if (!hasAmount) {
    return (
      <Button className="w-full" disabled size="lg">
        Insufficient {assetSymbol} balance
      </Button>
    );
  }

  return (
    <Button
      className={className}
      disabled={isLoading || isLoadingActionData}
      icon={isLoading || isLoadingActionData ? <Spinner size="xs" /> : null}
      onClick={(e) => {
        stopEventPropagation(e);
        act();
      }}
      size="lg"
    >
      {isLoading
        ? 'Pending'
        : isLoadingActionData
          ? 'Loading...'
          : !isReadyToMint
            ? `Approve ${moduleAmount?.value} ${moduleAmount?.asset.symbol}`
            : `${openActionCTA(uiData?.platformName)} for ${moduleAmount?.value} ${moduleAmount?.asset.symbol}`}
    </Button>
  );
};

export default DecentAction;