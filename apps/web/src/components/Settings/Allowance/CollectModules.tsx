import type { FC } from 'react';

import Loader from '@components/Shared/Loader';
import { DEFAULT_COLLECT_TOKEN, STATIC_ASSETS_URL } from '@lensshare/data/constants';
import {
  FollowModuleType,
  LimitType,
  useApprovedModuleAllowanceAmountQuery
} from '@lensshare/lens';

import { ErrorMessage, Select } from '@lensshare/ui';
import { useState } from 'react';

import Allowance from './Allowance';
import allowedOpenActionModules from '@lib/allowedOpen (1)';
import type { AllowedToken } from '@lensshare/types/hey';

import { useAppStore } from 'src/store/persisted/useAppStore';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokensStore';

const getAllowancePayload = (currency: string) => {
  return {
    currencies: [currency],
    followModules: [FollowModuleType.FeeFollowModule],
    openActionModules: allowedOpenActionModules
  };
};

const CollectModules: FC = () => {
  const { currentProfile } = useAppStore();
  const { allowedTokens } = useAllowedTokensStore();
  const [selectedCurrency, setSelectedCurrency] = useState(
    DEFAULT_COLLECT_TOKEN
  );
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const { data, error, loading, refetch } =
    useApprovedModuleAllowanceAmountQuery({
      fetchPolicy: 'no-cache',
      skip: !currentProfile?.id ,
      variables: { request: getAllowancePayload(DEFAULT_COLLECT_TOKEN) }
    });

  if (error) {
    return (
      <ErrorMessage
        className="mt-5"
        error={error as Error}
        title="Failed to load data"
      />
    );
  }

  return (
    <div className="mt-5">
      <div className="space-y-3">
        <div className="text-lg font-bold">
          Allow / revoke follow or collect modules
        </div>
        <p>
          In order to use collect feature you need to allow the module you use,
          you can allow and revoke the module anytime.
        </p>
      </div>
      <div className="divider my-5" />
      <div className="label mt-6">Select currency</div>
      <Select
          
          onChange={(event) => {
            const value = event.target.value as string;
            setCurrencyLoading(true);
            setSelectedCurrency(value);
            refetch({
              request: getAllowancePayload(value)
            }).finally(() => setCurrencyLoading(false));
          }}
          options={
            allowedTokens?.map((token) => ({
              icon: `${STATIC_ASSETS_URL}/images/tokens/${token.symbol}.svg`,
              label: token.name,
              selected: token.contractAddress === selectedCurrency,
              value: token.contractAddress
            })) || [{ label: 'Loading...', value: 'Loading...' }]
          }
        />
      {loading || currencyLoading ? (
        <div className="py-5">
          <Loader />
        </div>
      ) : (
        <Allowance allowance={data} />
      )}
    </div>
  );
};

export default CollectModules;
