import MetaTags from '@components/Common/MetaTags';

import type {
  MediaVideoMimeType,
  MetadataAttribute,
  VideoOptions
} from '@lens-protocol/metadata';
import {
  MetadataAttributeType,
  PublicationContentWarning,
  shortVideo,
  video
} from '@lens-protocol/metadata';

import type {
  CreateMomokaPostEip712TypedData,
  CreateOnchainPostEip712TypedData,
  ReferenceModuleInput
} from '@lensshare/lens';
import {
  useBroadcastOnchainMutation,
  useBroadcastOnMomokaMutation,
  useCreateMomokaPostTypedDataMutation,
  useCreateOnchainPostTypedDataMutation,
  usePostOnchainMutation,
  usePostOnMomokaMutation
} from '@lensshare/lens';

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi';

import type { VideoFormData } from './Details';
import Details from './Details';
import useEthersWalletClient from 'src/hooks/useEthersWalletClient';

import { useAppStore } from 'src/store/persisted/useAppStore';

import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { getProfile } from 'src/hooks/getProfile';
import type { CustomErrorWithData } from 'src/types/custom-types';
import {
  APP_NAME,
  BASE_URL,
  BUNDLR_CONNECT_MESSAGE,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  REQUESTING_SIGNATURE_MESSAGE
} from '@lensshare/data/constants';
import getSignature from '@lensshare/lib/getSignature';
import trimify from '@lensshare/lib/trimify';
import getUserLocale from '@lib/getUserLocale';
import { uploadToIPFS } from 'src/hooks/uploadToIPFS';
import logger from '@lensshare/lib/logger';
import { uploadToAr } from './uploadToAr';
import { getUploadedMediaType } from './getUploadedMediaType';
import { canUploadedToIpfs } from 'src/hooks/canUploadedToIpfs';
import { LensHub } from '@lensshare/abis';
import { checkLensManagerPermissions } from './checkLensManagerPermissions';
import useBytesStore, { UPLOADED_VIDEO_FORM_DEFAULTS } from 'src/store/persisted/bytes';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';

const CreateSteps = () => {
  const { irysData, setIrysData, getIrysInstance } = useBytesStore();
  const { uploadedMedia, setUploadedMedia } = useBytesStore();
  const { currentProfile } = useAppStore();

  const { lensHubOnchainSigNonce, setLensHubOnchainSigNonce } = useNonceStore();

  const { address } = useAccount();
  const { data: signer } = useEthersWalletClient();
  const router = useRouter();
  const handleWrongNetwork = useHandleWrongNetwork();
  const { canUseLensManager, canBroadcast } =
    checkLensManagerPermissions(currentProfile);

  const degreesOfSeparation = uploadedMedia.referenceModule
    ?.degreesOfSeparationReferenceModule?.degreesOfSeparation as number;

  const resetToDefaults = () => {
    setUploadedMedia(UPLOADED_VIDEO_FORM_DEFAULTS);
  };

  const redirectToChannelPage = () => {
    resetToDefaults();
    router.push(
      uploadedMedia.isByteVideo
        ? `/u/${getProfile(currentProfile)?.slug}?type=bytes`
        : `/u/${getProfile(currentProfile)?.slug}?type=bytes`
    );
  };

  const redirectToWatchPage = (pubId: string) => {
    resetToDefaults();

    router.push(`/bytes/${pubId}`);
  };

 

  useEffect(() => {
    if (handleWrongNetwork()) {
      return;
    }
  }, [handleWrongNetwork]);

  const stopLoading = () => {
    setUploadedMedia({
      buttonText: 'Post Now',
      loading: false
    });
  };

  const onError = (error: CustomErrorWithData) => {
    toast.error(error?.data?.message ?? error?.message ?? ERROR_MESSAGE);
    stopLoading();
  };

  const onCompleted = (__typename?: 'RelayError' | 'RelaySuccess') => {
    if (__typename === 'RelayError') {
      return;
    }
    return stopLoading();
  };

  const initIrys = async () => {
    if (signer && address && !irysData.instance) {
      toast.loading(BUNDLR_CONNECT_MESSAGE);
      const instance = await getIrysInstance(signer);
      if (instance) {
        setIrysData({ instance });
      }
    }
  };

  const { signTypedDataAsync } = useSignTypedData({
    onError
  });

  const { write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'post',
    onSuccess: (data) => {
      if (data.hash) {
        ({ txnHash: data.hash });
      }
      stopLoading();
      setLensHubOnchainSigNonce(lensHubOnchainSigNonce + 1);
    },
    onError: (error) => {
      onError(error);
      setLensHubOnchainSigNonce(lensHubOnchainSigNonce - 1);
    }
  });

  const getSignatureFromTypedData = async (
    data: CreateMomokaPostEip712TypedData | CreateOnchainPostEip712TypedData
  ) => {
    toast.loading(REQUESTING_SIGNATURE_MESSAGE);
    const signature = await signTypedDataAsync(getSignature(data));
    return signature;
  };

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) => {
      onCompleted(broadcastOnchain.__typename);
      if (broadcastOnchain.__typename === 'RelaySuccess') {
        const txnId = broadcastOnchain?.txId;
        ({ txnId });
      }
    }
  });

  const [broadcastOnMomoka] = useBroadcastOnMomokaMutation({
    onCompleted: ({ broadcastOnMomoka }) => {
      if (broadcastOnMomoka.__typename === 'CreateMomokaPublicationResult') {
        redirectToWatchPage(broadcastOnMomoka?.id);
      }
    }
  });

  const [createOnchainPostTypedData] = useCreateOnchainPostTypedDataMutation({
    onCompleted: async ({ createOnchainPostTypedData }) => {
      const { typedData, id } = createOnchainPostTypedData;
      try {
        if (canBroadcast) {
          const signature = await getSignatureFromTypedData(typedData);
          const { data } = await broadcastOnchain({
            variables: { request: { id, signature } }
          });
          if (data?.broadcastOnchain?.__typename === 'RelayError') {
            return write({ args: [typedData.value] });
          }
          return;
        }
        return write({ args: [typedData.value] });
      } catch {
        setUploadedMedia({
          buttonText: 'Post Now',
          loading: false
        });
      }
    },
    onError
  });

  const [postOnchain] = usePostOnchainMutation({
    onError,
    onCompleted: ({ postOnchain }) => {
      if (postOnchain.__typename === 'RelaySuccess') {
        onCompleted(postOnchain.__typename);
        ({ txnId: postOnchain.txId });
      }
    }
  });

  const [createMomokaPostTypedData] = useCreateMomokaPostTypedDataMutation({
    onCompleted: async ({ createMomokaPostTypedData }) => {
      const { typedData, id } = createMomokaPostTypedData;
      try {
        if (canBroadcast) {
          const signature = await getSignatureFromTypedData(typedData);
          const { data } = await broadcastOnMomoka({
            variables: { request: { id, signature } }
          });
          if (data?.broadcastOnMomoka?.__typename === 'RelayError') {
            return write({ args: [typedData.value] });
          }
          return;
        }
        return write({ args: [typedData.value] });
      } catch {
        setUploadedMedia({
          buttonText: 'Post Now',
          loading: false
        });
      }
    },
    onError
  });

  const [postOnMomoka] = usePostOnMomokaMutation({
    onError,
    onCompleted: ({ postOnMomoka }) => {
      if (postOnMomoka.__typename === 'CreateMomokaPublicationResult') {
        redirectToWatchPage(postOnMomoka.id);
      }
    }
  });

  const createPost = async (metadataUri: string) => {
    setUploadedMedia({
      buttonText: 'Posting...',
      loading: true
    });

    const isRestricted = Boolean(degreesOfSeparation);

    const { isRevertCollect } = uploadedMedia.collectModule;

    if (isRevertCollect) {
      // MOMOKA
      if (canUseLensManager) {
        return await postOnMomoka({
          variables: {
            request: {
              contentURI: metadataUri
            }
          }
        });
      }

      return await createMomokaPostTypedData({
        variables: {
          request: {
            contentURI: metadataUri
          }
        }
      });
    }

    // ON-CHAIN
    const referenceModuleDegrees = {
      commentsRestricted: isRestricted,
      mirrorsRestricted: isRestricted,
      degreesOfSeparation: degreesOfSeparation ?? 0,
      quotesRestricted: isRestricted
    };
    const referenceModule: ReferenceModuleInput = {
      ...(uploadedMedia.referenceModule?.followerOnlyReferenceModule
        ? { followerOnlyReferenceModule: true }
        : { degreesOfSeparationReferenceModule: referenceModuleDegrees })
    };

    const request = {
      contentURI: metadataUri,
      openActionModules: [],
      referenceModule
    };
    if (canUseLensManager) {
      return await postOnchain({
        variables: { request }
      });
    }
    return await createOnchainPostTypedData({
      variables: {
        options: { overrideSigNonce: lensHubOnchainSigNonce },
        request
      }
    });
  };

  const constructVideoMetadata = async () => {
    const attributes: MetadataAttribute[] = [
      {
        type: MetadataAttributeType.STRING,
        key: 'creator',
        value: `${getProfile(currentProfile)?.slug}`
      },
      {
        type: MetadataAttributeType.STRING,
        key: 'app',
        value: BASE_URL
      }
    ];

    const publicationMetadata: VideoOptions = {
      video: {
        item: uploadedMedia.dUrl,
        type: getUploadedMediaType(
          uploadedMedia.mediaType
        ) as MediaVideoMimeType,
        altTag: trimify(uploadedMedia.title),
        attributes,
        cover: uploadedMedia.thumbnail,
        duration: uploadedMedia.durationInSeconds
      },
      appId: APP_NAME,
      id: uuidv4(),
      attributes,
      content: trimify(uploadedMedia.description),
      locale: getUserLocale(),
      title: uploadedMedia.title,
      marketplace: {
        attributes,
        animation_url: uploadedMedia.dUrl,
        external_url: `https://mycrumbs.xyz${getProfile(currentProfile)?.slug}`,
        image: uploadedMedia.thumbnail,
        name: uploadedMedia.title,
        description: trimify(uploadedMedia.description)
      }
    };

    if (uploadedMedia.isSensitiveContent) {
      publicationMetadata.contentWarning = PublicationContentWarning.SENSITIVE;
    }

    const shortVideoMetadata = shortVideo(publicationMetadata);
    const longVideoMetadata = video(publicationMetadata);
    const metadataUri = await uploadToAr(
      uploadedMedia.isByteVideo ? shortVideoMetadata : longVideoMetadata
    );
    await createPost(metadataUri);
  };

  const create = async ({ dUrl }: { dUrl: string }) => {
    try {
      setUploadedMedia({
        buttonText: 'Storing metadata...',
        loading: true
      });
      uploadedMedia.dUrl = dUrl;

      await constructVideoMetadata();
    } catch (error) {
      logger.error('[Create Publication]');
    }
  };

  const uploadVideoToIpfs = async () => {
    const result = await uploadToIPFS(
      uploadedMedia.file as File,
      (percentCompleted) => {
        setUploadedMedia({
          buttonText: 'Uploading...',
          loading: true,
          percent: percentCompleted
        });
      }
    );
    if (!result.url) {
      stopLoading();
      return toast.error('IPFS Upload failed');
    }
    setUploadedMedia({
      percent: 100,
      dUrl: result.url
    });
    return await create({
      dUrl: result.url
    });
  };

  const uploadToIrys = async () => {
    if (!irysData.instance) {
      stopLoading();
      return await initIrys();
    }
    if (!uploadedMedia.stream) {
      stopLoading();
      return toast.error('Media not uploaded correctly');
    }
    if (parseFloat(irysData.balance) < parseFloat(irysData.estimatedPrice)) {
      stopLoading();
      return toast.error('Insufficient storage balance');
    }
    try {
      setUploadedMedia({
        loading: true,
        buttonText: 'Uploading...'
      });
      const { instance } = irysData;
      const tags = [
        { name: 'Content-Type', value: uploadedMedia.mediaType },
        { name: 'App-Name', value: APP_NAME },
        { name: 'Profile-Id', value: currentProfile?.id },
        // ANS-110 standard
        { name: 'Title', value: trimify(uploadedMedia.title) },
        { name: 'Type', value: uploadedMedia.type.toLowerCase() },
        {
          name: 'Description',
          value: trimify(uploadedMedia.description)
        }
      ];
      const fileSize = uploadedMedia?.file?.size as number;
      const uploader = instance.uploader.chunkedUploader;
      const chunkSize = 10000000; // 10 MB
      uploader.setChunkSize(chunkSize);
      if (fileSize < chunkSize) {
        toast.loading(REQUESTING_SIGNATURE_MESSAGE, { duration: 8000 });
      }
      uploader.on('chunkUpload', (chunkInfo) => {
        const expectedChunks = Math.floor(fileSize / chunkSize);
        if (expectedChunks === chunkInfo.id) {
          toast.loading(REQUESTING_SIGNATURE_MESSAGE, { duration: 8000 });
        }
        const percentCompleted = Math.round(
          (chunkInfo.totalUploaded * 100) / fileSize
        );
        setUploadedMedia({
          loading: true,
          percent: percentCompleted
        });
      });
      const upload = uploader.uploadData(uploadedMedia.stream as any, {
        tags
      });
      const response = await upload;
      setUploadedMedia({
        loading: false,
        dUrl: `ar://${response.data.id}`
      });
      return await create({
        dUrl: `ar://${response.data.id}`
      });
    } catch (error) {
      toast.error('Failed to upload media to Arweave');
      logger.error('[Error Irys Upload Media]');
      return stopLoading();
    }
  };

  const onUpload = async (data: VideoFormData) => {
    uploadedMedia.title = data.title;
    uploadedMedia.loading = true;
    uploadedMedia.description = data.description;
    uploadedMedia.isSensitiveContent = data.isSensitiveContent;
    setUploadedMedia({ ...uploadedMedia });
    // Upload video directly from source without uploading again
    if (
      uploadedMedia.dUrl?.length &&
      (uploadedMedia.dUrl.includes('ar://') ||
        uploadedMedia.dUrl.includes('ipfs://'))
    ) {
      return await create({
        dUrl: uploadedMedia.dUrl
      });
    }
    if (
      canUploadedToIpfs(uploadedMedia.file?.size) &&
      uploadedMedia.isUploadToIpfs
    ) {
      return await uploadVideoToIpfs();
    } else {
      await uploadToIrys();
    }
  };

  return (
    <div className="mx-10  my-6 gap-5">
      <MetaTags title="Create" />
      <div className="container mx-auto mt-16 max-w-screen-xl md:mt-10">
        <Details onCancel={resetToDefaults} onUpload={onUpload} />
      </div>
    </div>
  );
};

export default CreateSteps;
