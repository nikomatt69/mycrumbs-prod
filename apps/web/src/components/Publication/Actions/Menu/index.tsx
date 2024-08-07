import MenuTransition from '@components/Shared/MenuTransition';
import { Menu, MenuButton, MenuItems, MenuSection } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { AnyPublication, MirrorablePublication } from '@lensshare/lens';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import cn from '@lensshare/ui/cn';
import type { FC } from 'react';
import { Fragment } from 'react';
import { useAppStore } from 'src/store/persisted/useAppStore';

import Bookmark from './Bookmark';
import CopyPostText from './CopyPostText';
import Delete from './Delete';
import NotInterested from './NotInterested';
import Report from './Report';
import Share from './Share';
import Translate from './Translate';


interface PublicationMenuProps {
  publication: AnyPublication;
}

const PublicationMenu: FC<PublicationMenuProps> = ({ publication }) => {
  const { currentProfile } = useAppStore();
  const iconClassName = 'w-[15px] sm:w-[18px]';

  return (
    <Menu as="div" className="relative">
      
      <MenuButton as={Fragment}>
        <button
          className="rounded-full p-1.5 hover:bg-gray-300/20"
          onClick={stopEventPropagation}
          
          aria-label="More"
        >
          <EllipsisVerticalIcon
            className={cn('lt-text-gray-500', iconClassName)}
          />
        </button>
      </MenuButton>
      <MenuTransition  >
      
        <MenuItems
          static
          className="absolute right-0 z-[5] mt-1 w-max rounded-xl border bg-white shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          {currentProfile?.id === publication?.by?.id ? (
            <Delete publication={publication} />
          ) : (
            <Report publication={publication} />
          )}
          {currentProfile ? (
            <>
              <NotInterested publication={publication} />
              <Bookmark publication={publication} />
            </>
          ) : null}
          <Share publication={publication} />
          <Translate publication={publication} />
          <CopyPostText publication={publication} />

        </MenuItems>
      
      </MenuTransition>
    </Menu>
  );
};

export default PublicationMenu;
