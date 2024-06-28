
import type { FC } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { MetadataAttributeType } from '@lens-protocol/metadata';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useOpenActionStore } from 'src/store/non-persisted/useOpenActionStore';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { usePublicationAttachmentStore } from 'src/store/non-persisted/usePublicationAttachmentStore';
import { usePublicationAttributesStore } from 'src/store/non-persisted/usePublicationAttributesStore';
import getNftOpenActionKit from 'src/hooks/getNftOpenActionKit';
import { HEY_REFERRAL_PROFILE_ID,  KNOWN_ATTRIBUTES } from '@lensshare/data/constants';
import getURLs from '@lensshare/lib/getURLs';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import DecentOpenActionPreview from '@components/Publication/LensOpenActions/UnknownModule/Decent 2/DecentOpenActionPreview';
import SwapOpenAction from '@components/Publication/LensOpenActions/UnknownModule/Swap';
import { UnknownOpenActionModuleSettings } from '@lensshare/lens';
import getFavicon from 'src/utils/oembed/getFavicon';
import { OG } from '@lensshare/types/misc';
import PolymarketOembed from '@components/Shared/Oembed/PolymarketOembed';


interface OpenActionsPreviewsProps {
  setNftOpenActionEmbed: (nftOpenActionEmbed: any) => void;
}

const OpenActionsPreviews: FC<OpenActionsPreviewsProps> = ({
  setNftOpenActionEmbed
}) => {
  const { openAction, reset } = useOpenActionStore();

  const { publicationContent, quotedPublication } = usePublicationStore();
  const { attachments } = usePublicationAttachmentStore((state) => state);
  const { addAttribute, getAttribute, removeAttribute } =
    usePublicationAttributesStore();

  const urls = getURLs(publicationContent);

  const hasSwapOpenAction =
    openAction?.address === VerifiedOpenActionModules.Swap;
  const url = urls?.[0] || '';

  const fetchnftOpenActionEmbed = async (
    publicationContent: string
  ): Promise<any | undefined> => {
    const nftOpenActionKit = getNftOpenActionKit();
    const publicationContentUrls = getURLs(publicationContent);

    try {
      const calldata = await nftOpenActionKit.detectAndReturnCalldata({
        contentURI: publicationContentUrls[0],
        publishingClientProfileId: HEY_REFERRAL_PROFILE_ID
      });

      if (calldata) {
        return {
          unknownOpenAction: {
            address: VerifiedOpenActionModules.DecentNFT,
            data: calldata
          }
        };
      } else {
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching open action embed:', error);
      return undefined;
    }
  };

  const { data: nftOpenActionEmbed, isLoading: nftOpenActionEmbedLoading } =
    useQuery({
      enabled: Boolean(publicationContent),
      queryFn: () => fetchnftOpenActionEmbed(publicationContent),
      queryKey: ['fetchnftOpenActionEmbed', publicationContent]
    });

  const { data } = useQuery({
    enabled: Boolean(url),
    queryFn: async () => {
      const response = await axios.get(`/api/oembed`, {
        params: { url }
      });
      return response.data.oembed;
    },
    queryKey: ['getOembed', url],
    refetchOnMount: false
  });

  useEffect(() => {
    if (urls.length) {
      removeAttribute(KNOWN_ATTRIBUTES.HIDE_OEMBED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.length]);
  
  const [currentMarketId, setCurrentMarketId] = useState<string>('');

  useEffect(() => {
    if (currentMarketId) {
      setCurrentMarketId(currentMarketId);
    } else {
      setCurrentMarketId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMarketId]);

  useEffect(() => {
    if (nftOpenActionEmbed) {
      setNftOpenActionEmbed(nftOpenActionEmbed);
    } else {
      setNftOpenActionEmbed(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftOpenActionEmbed]);

  const og: OG = {
    description: data?.description,
    favicon: data?.url ? getFavicon(data.url) : '',
    frame: data?.frame,
    html: data?.html,
    image: data?.image,
    nft: data?.nft,
    site: data?.site,
    title: data?.title,
    url: url as string,
    polymarket: data?.polymarket
  };

  if (
    !nftOpenActionEmbed ||
    !currentMarketId ||
    !urls.length ||
    attachments.length ||
    quotedPublication ||
    getAttribute(KNOWN_ATTRIBUTES.HIDE_OEMBED)?.value === 'true'
  ) {
    return null;
  }

  if (nftOpenActionEmbed) {
    return (
      <div className="relative m-5">
        <DecentOpenActionPreview
          og={og}
          openActionEmbedLoading={nftOpenActionEmbedLoading}
        />
        <div className="absolute top-0 m-3">
          <button
            className="rounded-full bg-gray-900 p-1.5 opacity-75"
            onClick={() =>
              addAttribute({
                key: KNOWN_ATTRIBUTES.HIDE_OEMBED,
                type: MetadataAttributeType.BOOLEAN,
                value: 'true'
              })
            }
            type="button"
          >
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  if (hasSwapOpenAction) {
    return (
      <div className="relative m-5 w-fit">
        <SwapOpenAction
          module={
            {
              contract: { address: openAction.address },
              initializeCalldata: openAction.data
            } as UnknownOpenActionModuleSettings
          }
        />
        <div className="absolute -right-5 -top-5 m-2">
          <button
            className="rounded-full bg-gray-900 p-1.5 opacity-75"
            onClick={() => reset()}
            type="button"
          >
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }
  const isPolymarket = og.site?.toLowerCase().includes('polymarket');
  if (isPolymarket) {
    return <PolymarketOembed module={module as unknown as UnknownOpenActionModuleSettings} conditionId={og.url} publication={nftOpenActionEmbed} />;
  }
  return null;
};

export default OpenActionsPreviews;