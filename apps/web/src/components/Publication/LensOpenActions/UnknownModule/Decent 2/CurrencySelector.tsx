import type { AllowedToken } from '@lensshare/types/hey';
import type { FC } from 'react';
import type { Address } from 'viem';
import getAssetSymbol from '@lensshare/lib/getAssetSymbol';
import getRedstonePrice from '@lib/getRedstonePrice';
import getTokenImage from '@lensshare/lib/getTokenImage';

import { DEFAULT_COLLECT_TOKEN, STATIC_ASSETS_URL, SUPPORTED_DECENT_OA_TOKENS } from '@lensshare/data/constants';
import { TokenContracts } from '@lensshare/data/contracts';

import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import formatTokenBalances, { BalanceData } from 'src/hooks/formatTokenBalances';
import getBalanceData from 'src/hooks/getBalanceData';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokensStore';
import { useRatesStore } from 'src/store/persisted/useRatesStore';

interface CurrencySelectorProps {
  onSelectCurrency: (currency: Address) => void;
}

const CurrencySelector: FC<CurrencySelectorProps> = ({ onSelectCurrency }) => {
  const { fiatRates } = useRatesStore();
  const { allowedTokens } = useAllowedTokensStore();
  const { address } = useAccount();

  const { data: wmaticBalanceData, isLoading: wmaticBalanceLoading } =
    useBalance({
      address,
      chainId: 137,
      staleTime: 1000 * 60 * 5,
      token: SUPPORTED_DECENT_OA_TOKENS.WMATIC.address
    });

  const { data: wethBalanceData, isLoading: wethBalanceLoading } = useBalance({
    address,
    chainId: 137,
    staleTime: 1000 * 60 * 5,
    token: SUPPORTED_DECENT_OA_TOKENS.WETH.address
  });

  const { data: usdcBalanceData, isLoading: usdcBalanceLoading } = useBalance({
    address,
    chainId: 137,
    staleTime: 1000 * 60 * 5,
    token: SUPPORTED_DECENT_OA_TOKENS.USDC.address
  });

  const balanceData: Record<string, BalanceData> = {
    USDC: getBalanceData(
      usdcBalanceData,
      fiatRates,
      SUPPORTED_DECENT_OA_TOKENS.USDC
    ),
    WETH: getBalanceData(
      wethBalanceData,
      fiatRates,
      SUPPORTED_DECENT_OA_TOKENS.WETH
    ),
    WMATIC: getBalanceData(
      wmaticBalanceData,
      fiatRates,
      SUPPORTED_DECENT_OA_TOKENS.WMATIC
    )
  };

  const balances = formatTokenBalances(balanceData);
  const isLoading =
    wmaticBalanceLoading || wethBalanceLoading || usdcBalanceLoading;

  return (
    <div className="h-[80vh] w-full space-y-2 p-5">
      {allowedTokens
        .filter((t) =>
          Object.keys(SUPPORTED_DECENT_OA_TOKENS).includes(t.symbol)
        )
        .map((token) => {
          return (
            <div
              className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-500/10"
              key={token.symbol}
              onClick={(e) => {
                stopEventPropagation(e);
                onSelectCurrency(token.contractAddress as Address);
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <img
                    alt={token.symbol}
                    className="w-10 h-10"
                    height={40}
                    src={getTokenImage(token.symbol)}
                    title={token.name}
                    width={40}
                  />
                  <img
                    alt="Polygon"
                    className="absolute bottom-0 right-0"
                    height={16}
                    src={`${STATIC_ASSETS_URL}/images/chains/polygon.svg`}
                    title="Polygon"
                    width={16}
                  />
                </div>
                <div>
                  <b>{token.symbol}</b>
                  <p className="ld-text-gray-500 text-xs">Polygon</p>
                </div>
              </div>
              <div className="text-right">
                {isLoading ? (
                  <div className="shimmer mb-3 ml-auto h-4 w-16 rounded-lg bg-gray-200" />
                ) : (
                  <p>
                    {balances[token.symbol as keyof typeof balances]?.token ||
                      '--'}
                  </p>
                )}
                {isLoading ? (
                  <div className="shimmer ml-auto h-4 w-12 rounded-lg bg-gray-200" />
                ) : (
                  <p className="text-sm opacity-50">
                    $
                    {balances[token.symbol as keyof typeof balances]?.usd ||
                      '--'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default CurrencySelector;
