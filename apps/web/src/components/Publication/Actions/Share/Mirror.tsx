import { Menu, MenuItem } from '@headlessui/react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { LensHub } from '@lensshare/abis';
import { LENSHUB_PROXY } from '@lensshare/data/constants';
import { Errors } from '@lensshare/data/errors';
import { PUBLICATION } from '@lensshare/data/tracking';
import type {
  AnyPublication,
  MirrorablePublication,
  MomokaMirrorRequest,
  OnchainMirrorRequest
} from '@lensshare/lens';
import {
  TriStateValue,
  useBroadcastOnchainMutation,
  useBroadcastOnMomokaMutation,
  useCreateMomokaMirrorTypedDataMutation,
  useCreateOnchainMirrorTypedDataMutation,
  useMirrorOnchainMutation,
  useMirrorOnMomokaMutation
} from '@lensshare/lens';
import { useApolloClient } from '@lensshare/lens/apollo';
import checkDispatcherPermissions from '@lensshare/lib/checkDispatcherPermissions';
import getSignature from '@lensshare/lib/getSignature';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import { OptmisticPublicationType } from '@lensshare/types/enums';
import { OptimisticTransaction } from '@lensshare/types/misc';
import cn from '@lensshare/ui/cn';
import errorToast from '@lib/errorToast';
import { Leafwatch } from '@lib/leafwatch';
import { useCounter } from '@uidotdev/usehooks';
import type { FC } from 'react';
import { toast } from 'react-hot-toast';
import hasOptimisticallyMirrored from 'src/hooks/optimistic/hasOptimisticallyMirrored';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useMirrorOrQuoteOptimisticStore } from 'src/store/OptimisticActions/useMirrorOrQuoteOptimisticStore';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useAppStore } from 'src/store/persisted/useAppStore';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';

import { useContractWrite, useSignTypedData } from 'wagmi';

interface MirrorProps {
  publication: MirrorablePublication;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const Mirror: FC<MirrorProps> = ({ publication, setIsLoading, isLoading }) => {
  const { currentProfile } = useAppStore();
  const {
    decrementLensHubOnchainSigNonce,
    incrementLensHubOnchainSigNonce,
    lensHubOnchainSigNonce
  } = useNonceStore();
  const { addTransaction } = useTransactionStore();
  const hasMirrored =
    publication.operations.hasMirrored ||
    hasOptimisticallyMirrored(publication.id);

  const [shares, { increment }] = useCounter(
    publication.stats.mirrors + publication.stats.quotes
  );

  const handleWrongNetwork = useHandleWrongNetwork();
  const { cache } = useApolloClient();

  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const generateOptimisticMirror = ({
    txHash,
    txId
  }: {
    txHash?: string;
    txId?: string;
  }): OptimisticTransaction => {
    return {
      mirrorOn: publication?.id,
      txHash,
      txId,
      type: OptmisticPublicationType.Mirror
    };
  };

  const updateCache = () => {
    cache.modify({
      fields: {
        operations: (existingValue) => {
          return { ...existingValue, hasMirrored: true };
        }
      },
      id: cache.identify(publication)
    });
    cache.modify({
      fields: { mirrors: () => shares + 1 },
      id: cache.identify(publication.stats)
    });
  };

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const onCompleted = (
    __typename?:
      | 'CreateMomokaPublicationResult'
      | 'LensProfileManagerRelayError'
      | 'RelayError'
      | 'RelaySuccess'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return onError();
    }

    setIsLoading(false);
    increment();
    updateCache();
    toast.success('Post has been mirrored!');
    Leafwatch.track(PUBLICATION.MIRROR, { publication_id: publication.id });
  };

  const { signTypedDataAsync } = useSignTypedData({ onError });

  const { write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'mirror',
    onSuccess: (data) => {
      addTransaction(generateOptimisticMirror({ txHash: data.hash }));
      incrementLensHubOnchainSigNonce();
      onCompleted();
    },
    onError: (error) => {
      onError(error);
      decrementLensHubOnchainSigNonce();
    }
  });

  const [broadcastOnMomoka] = useBroadcastOnMomokaMutation({
    onCompleted: ({ broadcastOnMomoka }) =>
      onCompleted(broadcastOnMomoka.__typename),
    onError
  });

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename)
  });

  const typedDataGenerator = async (
    generatedData: any,
    isMomokaPublication = false
  ) => {
    const { id, typedData } = generatedData;
    const signature = await signTypedDataAsync(getSignature(typedData));

    if (canBroadcast) {
      if (isMomokaPublication) {
        return await broadcastOnMomoka({
          variables: { request: { id, signature } }
        });
      }


      const { data } = await broadcastOnchain({
        variables: { request: { id, signature } }
      });
      if (data?.broadcastOnchain.__typename === 'RelayError') {
        return write({ args: [typedData.value] });
      }
      return;
    }

    return write({ args: [typedData.value] });
  };

  // On-chain typed data generation
  const [createOnchainMirrorTypedData] =
    useCreateOnchainMirrorTypedDataMutation({
      onCompleted: async ({ createOnchainMirrorTypedData }) =>
        await typedDataGenerator(createOnchainMirrorTypedData),
      onError
    });

  // Momoka typed data generation
  const [createMomokaMirrorTypedData] = useCreateMomokaMirrorTypedDataMutation({
    onCompleted: async ({ createMomokaMirrorTypedData }) =>
      await typedDataGenerator(createMomokaMirrorTypedData, true),
    onError
  });

  // Onchain mutations
  const [mirrorOnchain] = useMirrorOnchainMutation({
    onCompleted: ({ mirrorOnchain }) => onCompleted(mirrorOnchain.__typename),
    onError
  });

  // Momoka mutations
  const [mirrorOnMomoka] = useMirrorOnMomokaMutation({
    onCompleted: ({ mirrorOnMomoka }) => onCompleted(mirrorOnMomoka.__typename),
    onError
  });

  if (publication.operations.canMirror === TriStateValue.No) {
    return null;
  }

  const createOnMomka = async (request: MomokaMirrorRequest) => {
    const { data } = await mirrorOnMomoka({ variables: { request } });
    if (data?.mirrorOnMomoka?.__typename === 'LensProfileManagerRelayError') {
      return await createMomokaMirrorTypedData({ variables: { request } });
    }
  };

  const createOnChain = async (request: OnchainMirrorRequest) => {
    const { data } = await mirrorOnchain({ variables: { request } });
    if (data?.mirrorOnchain.__typename === 'LensProfileManagerRelayError') {
      return await createOnchainMirrorTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request
        }
      });
    }
  };


    const createMirror = async () => {
      if (!currentProfile) {
        return toast.error(Errors.SignWallet);
      }
  
      
      if (handleWrongNetwork()) {
        return;
      }
      try {
        setIsLoading(true);
        const request: MomokaMirrorRequest | OnchainMirrorRequest = {
          mirrorOn: publication?.id
        };
  
        if (publication.momoka?.proof) {
          if (canUseLensManager) {
            return await createOnMomka(request);
          }
  
          return await createMomokaMirrorTypedData({ variables: { request } });
        }
  
        if (canUseLensManager) {
          return await createOnChain(request);
        }
  
        return await createOnchainMirrorTypedData({
          variables: {
            options: { overrideSigNonce: lensHubOnchainSigNonce },
            request
          }
        });
      } catch (error) {
        onError(error);
      }
    };
    return (
      <MenuItem
        as="div"
        className={({ focus }) =>
          cn(
            { 'dropdown-active': focus },
            hasMirrored ? 'text-green-500' : '',
            'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm'
          )
        }
        disabled={isLoading}
        onClick={createMirror}
      >
        <div className="flex items-center space-x-2">
          <ArrowsRightLeftIcon className="w-4 h-4" />
          <div>{hasMirrored ? 'Mirror again' : 'Mirror'}</div>
        </div>
      </MenuItem>
    );
  };
  
  export default Mirror;
  