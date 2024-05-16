
import type { ActionData, PublicationInfo } from 'nft-openaction-kit';
import type { Address } from 'viem';

import ActionInfo from '@components/Shared/Oembed/Nft/ActionInfo';

import errorToast from '@lib/errorToast';
import { Leafwatch } from '@lib/leafwatch';
import { NftOpenActionKit } from 'nft-openaction-kit';
import { type FC, useEffect, useRef, useState } from 'react';

import { useAccount } from 'wagmi';

import { OPEN_ACTION_EMBED_TOOLTIP, openActionCTA } from '.';
import DecentOpenActionModule from './Module';
import { AnyPublication, MirrorablePublication, UnknownOpenActionModuleSettings } from '@lensshare/lens';
import { Nft, OG } from '@lensshare/types/misc';
import { AllowedToken } from '@lensshare/types/hey';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { CHAIN_ID, HEY_REFERRAL_PROFILE_ID, ZERO_ADDRESS } from '@lensshare/data/constants';
import sanitizeDStorageUrl from '@lensshare/lib/sanitizeDStorageUrl';
import { Button, Card, Spinner, Tooltip, Image } from '@lensshare/ui';
import { PUBLICATION } from '@lensshare/data/tracking';
import DecentOpenActionShimmer from './Decent Open Action Shimmer';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import { useOaCurrency } from 'src/store/persisted/useOaCurrency';
import { CHAIN } from '@lib/costantChain';
import { useNftOaCurrencyStore } from 'src/store/persisted/useNftOaCurrencyStore';
import getNftOpenActionKit from 'src/hooks/getNftOpenActionKit';
import { useQuery } from '@tanstack/react-query';
import cn from '@lensshare/ui/cn';

const formatPublicationData = (
  targetPublication: MirrorablePublication
): PublicationInfo => {
  const [profileId, pubId] = targetPublication.id.split('-');

  const unknownModules =
    targetPublication.openActionModules as UnknownOpenActionModuleSettings[];
  const actionModules = unknownModules.map(
    (module) => module.contract.address
  ) as string[];
  const actionModulesInitDatas = unknownModules.map(
    (module) => module.initializeCalldata
  ) as string[];

  return {
    actionModules,
    actionModulesInitDatas,
    profileId: parseInt(profileId, 16).toString(),
    pubId: parseInt(pubId, 16).toString()
  };
};

interface FeedEmbedProps {
  isFullPublication?: boolean;
  mirrorPublication?: AnyPublication;
  og: OG;
  publication: AnyPublication;
}

const FeedEmbed: FC<FeedEmbedProps> = ({
  mirrorPublication,
  og,
  publication
}) => {
  const { address } = useAccount();
  const { selectedNftOaCurrency } = useNftOaCurrencyStore();

  const [showOpenActionModal, setShowOpenActionModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [nft, setNft] = useState({
    chain: og.nft?.chain || null,
    collectionName: og.nft?.collectionName || '',
    contractAddress: og.nft?.contractAddress || ZERO_ADDRESS,
    creatorAddress: og.nft?.creatorAddress || ZERO_ADDRESS,
    description: og.description || '',
    endTime: null,
    mediaUrl: og.nft?.mediaUrl || og.image || '',
    mintCount: null,
    mintStatus: null,
    mintUrl: null,
    schema: og.nft?.schema || '',
    sourceUrl: og.url
  });
  const [isNftCoverLoaded, setIsNftCoverLoaded] = useState(false);

  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;
  const module = targetPublication.openActionModules.find(
    (module) => module.contract.address === VerifiedOpenActionModules.DecentNFT
  );

  const getActionData = async (): Promise<ActionData> => {
    const nftOpenActionKit = getNftOpenActionKit();
    const pubInfo = formatPublicationData(targetPublication);

    return await nftOpenActionKit
      .actionDataFromPost({
        executingClientProfileId: HEY_REFERRAL_PROFILE_ID,
        mirrorerProfileId: mirrorPublication?.by.id,
        mirrorPubId: mirrorPublication?.id,
        paymentToken: selectedNftOaCurrency,
        post: pubInfo,
        profileId: targetPublication.by.id,
        profileOwnerAddress: targetPublication.by.ownedBy.address,
        quantity: selectedQuantity,
        senderAddress: address || ZERO_ADDRESS,
        sourceUrl: og.url,
        srcChainId: CHAIN_ID.toString()
      })
      .then((actionData) => {
        setNft((prevNft) => ({
          ...prevNft,
          chain: actionData.uiData.dstChainId.toString() || prevNft.chain,
          collectionName: actionData.uiData.nftName || prevNft.collectionName,
          creatorAddress: (actionData.uiData.nftCreatorAddress ||
            prevNft.creatorAddress) as `0x{string}`,
          mediaUrl:
            sanitizeDStorageUrl(actionData.uiData.nftUri) || prevNft.mediaUrl,
          schema: actionData.uiData.tokenStandard || prevNft.schema
        }));

        return actionData;
      });
  };

  const {
    data: actionData,
    isLoading: loadingActionData,
    refetch
  } = useQuery({
    enabled:
      Boolean(module) &&
      Boolean(selectedNftOaCurrency) &&
      Boolean(address) &&
      Boolean(targetPublication),
    queryFn: getActionData,
    queryKey: [
      'getActionData',
      selectedNftOaCurrency,
      selectedQuantity,
      address,
      targetPublication?.id
    ]
  });

  useEffect(() => {
    refetch();
  }, [selectedNftOaCurrency, address, refetch]);

  if (!module) {
    return null;
  }

  return (
    <>
      <Card className="mt-3" forceRounded onClick={stopEventPropagation}>
        <div className="relative h-[350px] max-h-[350px] w-full overflow-hidden rounded-t-xl">
          <Image
            alt={nft.collectionName}
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg filter"
            src={nft.mediaUrl}
          />
          <Image
            alt={nft.collectionName}
            className={cn(
              'relative h-full w-full object-contain transition-opacity duration-500',
              isNftCoverLoaded ? 'visible opacity-100' : 'invisible opacity-0'
            )}
            onLoad={() => setIsNftCoverLoaded(true)}
            src={nft.mediaUrl}
          />
        </div>
        {actionData && Boolean(nft) && !loadingActionData ? (
          <div className="flex flex-col items-start justify-between gap-4 border-t p-4 sm:flex-row sm:items-center sm:gap-0 dark:border-gray-700">
            {nft.creatorAddress ? (
              <ActionInfo
                actionData={actionData}
                collectionName={nft.collectionName}
                creatorAddress={nft.creatorAddress}
                uiData={actionData?.uiData}
              />
            ) : null}
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setShowOpenActionModal(true);
                Leafwatch.track(PUBLICATION.OPEN_ACTIONS.DECENT.OPEN_DECENT, {
                  publication_id: publication.id
                });
              }}
              size="lg"
            >
              {openActionCTA(actionData.uiData.platformName)}
            </Button>
          </div>
        ) : loadingActionData ? (
          <DecentOpenActionShimmer />
        ) : null}
      </Card>
      <DecentOpenActionModule
        actionData={actionData}
        loadingCurrency={loadingActionData}
        module={module as UnknownOpenActionModuleSettings}
        nft={nft}
        onClose={() => setShowOpenActionModal(false)}
        publication={targetPublication}
        selectedQuantity={selectedQuantity}
        setSelectedQuantity={setSelectedQuantity}
        show={showOpenActionModal}
      />
    </>
  );
};

export default FeedEmbed;
