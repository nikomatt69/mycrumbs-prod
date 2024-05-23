import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import cn from '@lensshare/ui/cn';
import type { FC } from 'react';
import { useAppStore } from 'src/store/persisted/useAppStore';

import MenuTransition from '../MenuTransition';
import Bookmarks from './NavItems/Bookmarks';
import Contact from './NavItems/Contact';
import ReportBug from './NavItems/ReportBug';

const MoreNavItems: FC = () => {
  const { currentProfile } = useAppStore();

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <MenuButton
            className={cn(
              'w-full cursor-pointer rounded-md px-2 py-1 text-left text-sm font-bold tracking-wide md:px-3',
              {
                'bg-gray-200 text-black dark:bg-gray-800 dark:text-white': open,
                'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white':
                  !open
              }
            )}
          >
            More
          </MenuButton>
          <MenuTransition>
            <MenuItems
              static
              className="absolute mt-2 rounded-xl border bg-white py-1 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            >
              {currentProfile ? (
                <>
                  <MenuItem
                    as="div"
                    className={({ active }: { active: boolean }) =>
                      cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
                    }
                  >
                    <Bookmarks />
                  </MenuItem>
                  <div className="divider" />
                </>
              ) : null}
              <MenuItem
                as="div"
                className={({ active }: { active: boolean }) =>
                  cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
                }
              >
                <Contact />
              </MenuItem>
              <MenuItem
                as="div"
                className={({ active }: { active: boolean }) =>
                  cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
                }
              >
                <ReportBug />
              </MenuItem>
            </MenuItems>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
};

export default MoreNavItems;
