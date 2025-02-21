import type { FC } from 'react';

import {
  Disclosure,
  DisclosureButton,
  DisclosureButtonProps,
  DisclosurePanel,
  DisclosurePanelProps
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import type { ActionData } from 'nft-openaction-kit';
import { HelpTooltip } from '@lensshare/ui';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';


interface FeesDisclosureProps {
  actionData?: ActionData;
  bridgeFee: number;
  formattedTotalAmount: number;
  formattedTotalFees: number;
  tokenSymbol: string;
}

const FeesDisclosure: FC<FeesDisclosureProps> = ({
  actionData,
  bridgeFee,
  formattedTotalAmount,
  formattedTotalFees,
  tokenSymbol
}) => {
  return (
    <Disclosure>
      <div className="ld-text-gray-500 flex items-center justify-between space-y-0.5">
        <DisclosureButton
          className="flex items-center space-x-1.5"
          onClick={stopEventPropagation}
        >
          <span>Lens Creator Fee</span>
          <ChevronDownIcon className="w-3 h-3" strokeWidth={3} />
        </DisclosureButton>
        
      </div>
      <DisclosurePanel className="mt-1.5 space-y-1 text-sm">
        <div className="ld-text-gray-500 flex hidden items-center justify-between">
          <span className="flex items-center space-x-2">
            <span>↳</span>
            <p>
              {actionData?.actArgumentsFormatted.dstChainId === 137
                ? 'Transaction Fee'
                : 'Bridge Fee'}
            </p>
          </span>
          <p>
            {bridgeFee.toFixed(4)} {tokenSymbol}
          </p>
        </div>
        <div className="ld-text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-2">
              <span>↳</span>
              <p>Lens Creator Fee</p>
            </span>
            <HelpTooltip>
              <div className="max-w-xs py-1 leading-5">
                Lens creator fee is distributed between publication creator,
                application, Lens treasury, and mirror (if applicable)
              </div>
            </HelpTooltip>
          </div>
          <p>
            {(formattedTotalAmount * 0.05).toFixed(4)} {tokenSymbol}
          </p>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default FeesDisclosure;