import { Menu, MenuItem } from '@headlessui/react';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { type AnyPublication, TriStateValue, MirrorablePublication } from '@lensshare/lens';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import cn from '@lensshare/ui/cn';
import type { FC } from 'react';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { useAppStore } from 'src/store/persisted/useAppStore';

interface QuoteProps {
  publication: MirrorablePublication;
}

const Quote: FC<QuoteProps> = ({ publication }) => {
  const { currentProfile } = useAppStore();
  const { setShowAuthModal, setShowNewPostModal } = useGlobalModalStateStore();
  const { setQuotedPublication } = usePublicationStore();

  const publicationType = publication.__typename;

  if (publication.operations.canQuote === TriStateValue.No) {
    return null;
  }

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { 'dropdown-active': focus },
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm'
        )
      }
      onClick={() => {
        if (!currentProfile) {
          setShowAuthModal(true);
          return;
        }

        

        setQuotedPublication(publication);
        setShowNewPostModal(true);
      }}
    >
      <div className="flex items-center space-x-2">
        <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
        <div>
          {publicationType === 'Comment' ? 'Quote comment' : 'Quote post'}
        </div>
      </div>
    </MenuItem>
  );
};

export default Quote;
