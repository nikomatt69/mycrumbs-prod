import { useState, type FC, useEffect } from 'react';

import Oembed from '@components/Shared/Oembed';
import getURLs from '@lensshare/lib/getURLs';
import getNft from '@lensshare/lib/nft/getNft';


import { KNOWN_ATTRIBUTES, ZERO_PUBLICATION_ID } from '@lensshare/data/constants';

import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePublicationAttachmentStore } from 'src/store/non-persisted/usePublicationAttachmentStore';
import { usePublicationAttributesStore } from 'src/store/non-persisted/usePublicationAttributesStore';
import { MetadataAttributeType } from '@lens-protocol/metadata';
import { UnknownOpenActionModuleSettings } from '@lensshare/lens';
import MarketEmbed from '@components/Publication/LensOpenActions/UnknownModule/Polymarket/MarketEmbed';

const LinkPreviews: FC = () => {
  const { publicationContent, quotedPublication } = usePublicationStore();
  const { attachments } = usePublicationAttachmentStore((state) => state);
  const { addAttribute, getAttribute, removeAttribute } =
    usePublicationAttributesStore();
  const [showRemove, setShowRemove] = useState(false);

  const urls = getURLs(publicationContent);

  useEffect(() => {
    if (urls.length) {
      removeAttribute(KNOWN_ATTRIBUTES.HIDE_OEMBED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.length]);

  if (
    !urls.length ||
    attachments.length ||
    quotedPublication ||
    getAttribute(KNOWN_ATTRIBUTES.HIDE_OEMBED)?.value === 'true'
  ) {
    return null;
  }
  const isPolymarket = (urls[0]).toLowerCase().includes('polymarket');
  return (
    <div className="relative m-5">
    {   (isPolymarket) ? (
       <MarketEmbed conditionId={urls[0] } module={module as unknown as UnknownOpenActionModuleSettings}  />):( <Oembed
        onLoad={(og) => setShowRemove(og?.title ? true : false)}
        url={urls[0]}
      /> )}
       
      {showRemove && (
        <div className="absolute top-0 -m-3">
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
            <XMarkIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkPreviews;
