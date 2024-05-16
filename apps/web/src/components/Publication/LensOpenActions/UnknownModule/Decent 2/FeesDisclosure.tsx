import type { FC } from 'react';

import {
  Disclosure,
  DisclosureButtonProps,
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
  loadingCurrencyDetails: boolean;
  tokenSymbol: string;
}

const FeesDisclosure: FC<FeesDisclosureProps> = ({
  actionData,
  bridgeFee,
  formattedTotalAmount,
  formattedTotalFees,
  loadingCurrencyDetails,
  tokenSymbol
}) => {
  return (
    <Disclosure>
      <div className="ld-text-gray-500 flex items-center justify-between space-y-0.5">
        <Disclosure.Button
          className="flex items-baseline gap-1 space-x-1"
          onClick={stopEventPropagation}
        >
          Fees <ChevronDownIcon className="h-3 w-3" strokeWidth={3} />
        </Disclosure.Button>
        {loadingCurrencyDetails ? (
          <span className="shimmer h-6 w-24 rounded-lg bg-gray-200" />
        ) : (
          <span>
            {formattedTotalFees.toFixed(4)} {tokenSymbol}
          </span>
        )}
      </div>
      <Disclosure.Panel className="mt-2 space-y-2">
        <div className="ld-text-gray-500 flex items-center justify-between">
          <span>
            {actionData?.actArgumentsFormatted.dstChainId === 137
              ? 'Transaction Fee'
              : 'Bridge Fee'}
          </span>
          {loadingCurrencyDetails ? (
            <span className="shimmer h-6 w-24 rounded-lg bg-gray-200" />
          ) : (
            <span>
              {bridgeFee.toFixed(4)} {tokenSymbol}
            </span>
          )}
        </div>
        <div className="ld-text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-1 space-x-1">
            <span>Lens Creator Fee</span>
            <HelpTooltip>
              <div className="whitespace-pre-wrap px-2 py-3 leading-tight">
                {`Lens creator fee is distributed between publication creator,\napplication, Lens treasury, and mirror (if applicable)`}
              </div>
            </HelpTooltip>
          </div>
          {loadingCurrencyDetails ? (
            <span className="shimmer h-6 w-28 rounded-lg bg-gray-200" />
          ) : (
            <span>
              {(formattedTotalAmount * 0.05).toFixed(4)} {tokenSymbol}
            </span>
          )}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
};

export default FeesDisclosure;
