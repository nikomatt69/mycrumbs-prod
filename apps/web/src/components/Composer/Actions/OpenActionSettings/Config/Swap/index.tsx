import type { FC } from 'react';
import type { Address } from 'viem';

import ToggleWithHelper from '@components/Shared/ToggleWithHelper';
import {
  DEFAULT_COLLECT_TOKEN,
  KNOWN_ATTRIBUTES
} from '@lensshare/data/constants';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { useEffect } from 'react';
import { createTrackedSelector } from 'react-tracked';

import { encodeAbiParameters, isAddress } from 'viem';
import { create } from 'zustand';

import SaveOrCancel from '../../SaveOrCancel';
import DefaultAmountConfig from './DefaultAmountConfig';
import PoolConfig from './PoolConfig';
import RewardConfig from './RewardConfig';
import TokenConfig from './TokenConfig';
import { useOpenActionStore } from 'src/store/non-persisted/useOpenActionStore';
import { usePublicationAttributesStore } from 'src/store/non-persisted/usePublicationAttributesStore';
import { useAppStore } from 'src/store/persisted/useAppStore';

interface State {
  enabled: boolean;
  reset: () => void;
  rewardsPoolId: null | number;
  setEnabled: (enabled: boolean) => void;
  setRewardsPoolId: (rewardsPoolId: null | number) => void;
  setSharedRewardPercent: (sharedRewardPercent: number) => void;
  setToken: (token: Address) => void;
  sharedRewardPercent: number;
  token: Address;
}

const store = create<State>((set) => ({
  enabled: false,
  reset: () =>
    set({
      enabled: false,
      rewardsPoolId: null,
      sharedRewardPercent: 0,
      token: DEFAULT_COLLECT_TOKEN as Address
    }),
  rewardsPoolId: null,
  setEnabled: (enabled) => set({ enabled }),
  setRewardsPoolId: (rewardsPoolId) => set({ rewardsPoolId }),
  setSharedRewardPercent: (sharedRewardPercent) => set({ sharedRewardPercent }),
  setToken: (token) => set({ token }),
  sharedRewardPercent: 0,
  token: DEFAULT_COLLECT_TOKEN as Address
}));

export const useSwapActionStore = createTrackedSelector(store);

const SwapConfig: FC = () => {
  const { currentProfile } = useAppStore();
  const { openAction, setOpenAction, setShowModal } = useOpenActionStore();
  const {
    enabled,
    reset,
    rewardsPoolId,
    setEnabled,
    sharedRewardPercent,
    token
  } = useSwapActionStore();
  const { removeAttribute } = usePublicationAttributesStore();

  const resetOpenAction = () => {
    removeAttribute(KNOWN_ATTRIBUTES.SWAP_OA_DEFAULT_AMOUNT);
    reset();
  };

  useEffect(() => {
    if (!openAction) {
      removeAttribute(KNOWN_ATTRIBUTES.SWAP_OA_DEFAULT_AMOUNT);
      resetOpenAction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = () => {
    setOpenAction({
      address: VerifiedOpenActionModules.Swap,
      data: encodeAbiParameters(
        [
          { name: 'isDirectPromotion', type: 'bool' },
          { name: 'sharedRewardPercent', type: 'uint16' },
          { name: 'recipient', type: 'address' },
          { name: 'rewardsPoolId', type: 'uint256' },
          { name: 'token', type: 'address' }
        ],
        [
          (rewardsPoolId || 0) <= 0,
          sharedRewardPercent * 100,
          currentProfile?.ownedBy.address as Address,
          BigInt(rewardsPoolId || 0),
          token as Address
        ]
      )
    });
    setShowModal(false);
  };

  return (
    <>
      <div className="p-5">
        <ToggleWithHelper
          description="Token Swap lets you embed a swap widget in a post."
          heading="Enable swap"
          on={enabled}
          setOn={() => {
            setEnabled(!enabled);
            if (enabled) {
              resetOpenAction();
            }
          }}
        />
      </div>
      {enabled && (
        <>
          <div className="divider" />
          <div className="m-5">
            <TokenConfig />
            <RewardConfig />
            <PoolConfig />
            <DefaultAmountConfig />
          </div>
          <div className="divider" />
          <div className="m-5">
            <SaveOrCancel
              onSave={onSave}
              saveDisabled={token.length === 0 || !isAddress(token)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default SwapConfig;
