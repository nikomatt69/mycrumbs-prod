
import type { Address } from 'viem';

import errorToast from '@lib/errorToast';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';


import checkDispatcherPermissions from '@lensshare/lib/checkDispatcherPermissions';
import { LensHub } from '@lensshare/abis';
import { LENSHUB_PROXY } from '@lensshare/data/constants';
import { ActOnOpenActionLensManagerRequest, OnchainReferrer, useActOnOpenActionMutation, useBroadcastOnchainMutation, useCreateActOnOpenActionTypedDataMutation } from '@lensshare/lens';
import getSignature from '@lensshare/lib/getSignature';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useContractWrite, useSignTypedData } from 'wagmi';
import { useAppStore } from 'src/store/persisted/useAppStore';

interface CreatePublicationProps {
  onSuccess?: () => void;
  errorCallback?: (error?: any) => void;
  signlessApproved?: boolean;
  successCallback?: () => void;
  successToast?: string;
}

const useActOnUnknownOpenAction = ({
  onSuccess,
  successCallback,
  errorCallback,
  signlessApproved = false,
  successToast
}: CreatePublicationProps) => {
  const { currentProfile } = useAppStore();
  const {
    decrementLensHubOnchainSigNonce,
    incrementLensHubOnchainSigNonce,
    lensHubOnchainSigNonce
  } = useNonceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txId, setTxId] = useState<string | undefined>();
  const handleWrongNetwork = useHandleWrongNetwork();

  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
    errorCallback?.(error);
  };

  const onCompleted = (
    __typename?: 'LensProfileManagerRelayError' | 'RelayError' | 'RelaySuccess'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return;
    }

    onSuccess?.();
    setIsLoading(false);
    successCallback?.();
    toast.success(successToast || 'Success!', { duration: 5000 });
  };

  const { signTypedDataAsync } = useSignTypedData({ onError } );
  const { write } = useContractWrite({
    abi: LensHub,
    address: LENSHUB_PROXY,
    functionName: 'act',
      onError: (error: Error) => {
        onError(error);
        decrementLensHubOnchainSigNonce();
      },
      onSuccess: () => {
        onCompleted();
        incrementLensHubOnchainSigNonce();
      }
    
  });


  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename)
  });

  const [createActOnOpenActionTypedData] =
    useCreateActOnOpenActionTypedDataMutation({
      onCompleted: async ({ createActOnOpenActionTypedData }) => {
        try {
          const { id, typedData } = createActOnOpenActionTypedData;
          if (handleWrongNetwork()) {
            return;
          }

          if (canBroadcast) {
            const signature = await signTypedDataAsync(getSignature(typedData));
            const { data } = await broadcastOnchain({
              variables: { request: { id, signature } }
            });
            if (data?.broadcastOnchain.__typename === 'RelayError') {
              const txResult = await write({ args: [typedData.value] });
              setTxHash(txResult as `0x${string}` | undefined);
              return txResult;
            }
            if (data?.broadcastOnchain.__typename === 'RelaySuccess') {
              setTxId(data?.broadcastOnchain.txId);
            }
            incrementLensHubOnchainSigNonce();

            return;
          }
          

          const txResult = await write({ args: [typedData.value] });
          setTxHash(txResult as `0x${string}` | undefined);
          return txResult;
        } catch (error) {
          onError(error);
        }
      },
      onError
    });

  // Act
  const [actOnOpenAction] = useActOnOpenActionMutation({
    onCompleted: ({ actOnOpenAction }) =>
      onCompleted(actOnOpenAction.__typename),
    onError
  });

  // Act via Lens Manager
  const actViaLensManager = async (
    request: ActOnOpenActionLensManagerRequest
  ) => {
    const { data, errors } = await actOnOpenAction({ variables: { request } });

    if (errors?.toString().includes('has already acted on')) {
      return;
    }

    if (data?.actOnOpenAction.__typename === 'RelaySuccess') {
      setTxId(data?.actOnOpenAction.txId);
    }

    if (
      !data?.actOnOpenAction ||
      data?.actOnOpenAction.__typename === 'LensProfileManagerRelayError'
    ) {
      return await createActOnOpenActionTypedData({ variables: { request } });
    }
  };

  const actOnUnknownOpenAction = async ({
    address,
    data,
    publicationId,
    referrers
  }: {
    address: Address;
    data: string;
    publicationId: string;
    referrers?: OnchainReferrer[];
  }) => {
    try {
      setIsLoading(true);

      const actOnRequest: ActOnOpenActionLensManagerRequest = {
        actOn: { unknownOpenAction: { address, data } },
        for: publicationId,
        referrers
      };

      if (canUseLensManager && signlessApproved) {
        return await actViaLensManager(actOnRequest);
      }

      return await createActOnOpenActionTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request: actOnRequest
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  return { actOnUnknownOpenAction, isLoading, txHash, txId };
};

export default useActOnUnknownOpenAction;