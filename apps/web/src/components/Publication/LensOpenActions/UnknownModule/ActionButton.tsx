import type {
  Amount,
  ApprovedAllowanceAmountResult,
  UnknownOpenActionModuleSettings
} from '@lensshare/lens';
import type { FC, ReactNode } from 'react';

import AllowanceButton from '@components/Settings/Allowance/Button';
import LoginButton from '@components/Shared/Navbar/LoginButton';
import NoBalanceError from '@components/Shared/NoBalanceError';
import { useApprovedModuleAllowanceAmountQuery } from '@lensshare/lens';
import { Button, Spinner, WarningMessage } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import getCurrentSession from '@lib/getCurrentSession';
import { useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import toast from 'react-hot-toast';

interface ActionButtonProps {
  act: () => void;
  className?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  module: UnknownOpenActionModuleSettings;
  moduleAmount?: Amount;
  title: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  act,
  className = '',
  icon,
  isLoading = false,
  module,
  moduleAmount,
  title
}) => {
  const [allowed, setAllowed] = useState(true);
  const { id: sessionProfileId } = getCurrentSession();
  const { address } = useAccount();

  const amount = Number(moduleAmount?.value || '0');
  const assetAddress = moduleAmount?.asset?.contract.address;
  const assetDecimals = moduleAmount?.asset?.decimals || 18;

  const { data: allowanceData, loading: allowanceLoading } =
    useApprovedModuleAllowanceAmountQuery({
      fetchPolicy: 'no-cache',
      onCompleted: ({ approvedModuleAllowanceAmount }) => {
        if (!amount) {
          return;
        }

        const allowedAmount = parseFloat(
          approvedModuleAllowanceAmount[0]?.allowance.value
        );
        setAllowed(allowedAmount > amount);
      },
      skip: !amount || !sessionProfileId || !assetAddress,
      variables: {
        request: {
          currencies: [assetAddress],
          unknownOpenActionModules: [module.contract.address]
        }
      }
    });

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

  if (!sessionProfileId) {
    return (
      <Button
        className={cn('mt-5', className)}
        icon={icon ? isLoading ? <Spinner size="xs" /> : icon : null}
        onClick={() => toast.error('Login to perform this action')}
      >
        {title}
      </Button>
    );
  }

  if (allowanceLoading) {
    return (
      <div
        className={cn('shimmer mt-5 h-[34px] w-28 rounded-full', className)}
      />
    );
  }

  if (!allowed) {
    return (
      <AllowanceButton
        allowed={allowed}
        
        module={
          allowanceData
            ?.approvedModuleAllowanceAmount[0] as ApprovedAllowanceAmountResult
        }
        setAllowed={setAllowed}
        title="Enable open action"
      />
    );
  }

  if (!hasAmount) {
    return (
      <WarningMessage
        className="mt-5 w-full"
        message={<NoBalanceError moduleAmount={moduleAmount as Amount} />}
      />
    );
  }

  return (
    <Button
      className={cn('mt-5', className)}
      disabled={isLoading || !amount}
      icon={icon ? isLoading ? <Spinner size="xs" /> : icon : null}
      onClick={act}
    >
      {title}
    </Button>
  );
};

export default ActionButton;
