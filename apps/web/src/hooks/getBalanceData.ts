import { FiatRate } from "@lensshare/types/misc";
import { BalanceData } from "./formatTokenBalances";


interface BalanceInfo {
  decimals?: number;
  value?: bigint | BigInt;
}

interface CurrencyInfo {
  address: `0x${string}`;
  visibleDecimals: number;
}

const getBalanceData = (
  balanceData: BalanceInfo | undefined,
  fiatRates: FiatRate[],
  currency: CurrencyInfo
): BalanceData => {
  const fiatRate =
    fiatRates.find((rate) => rate.address === currency.address.toLowerCase())
      ?.fiat || 0;

  const value: bigint =
    typeof balanceData?.value === 'bigint'
      ? balanceData.value
      : BigInt(balanceData?.value?.toString() || '0');

  return {
    decimals: balanceData?.decimals || 0,
    fiatRate,
    value,
    visibleDecimals: currency.visibleDecimals
  };
};

export default getBalanceData;