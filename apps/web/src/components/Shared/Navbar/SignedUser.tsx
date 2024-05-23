import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { Profile } from '@lensshare/lens';
import getAvatar from '@lensshare/lib/getAvatar';
import getProfile from '@lensshare/lib/getProfile';
import { Image } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import type { FC } from 'react';
import { useAppStore } from 'src/store/persisted/useAppStore';


import MenuTransition from '../MenuTransition';
import Slug from '../Slug';
import { NextLink } from './MenuItems';
import MobileDrawerMenu from './MobileDrawerMenu';
import AppVersion from './NavItems/AppVersion';

import Logout from './NavItems/Logout';
import Mod from './NavItems/Mod';
import Settings from './NavItems/Settings';
import SwitchProfile from './NavItems/SwitchProfile';
import ThemeSwitch from './NavItems/ThemeSwitch';
import YourProfile from './NavItems/YourProfile';
import {
  ADMIN_ADDRESS,
  ADMIN_ADDRESS2,
  ADMIN_ADDRESS3
} from '@lensshare/data/constants';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';

const SignedUser: FC = () => {
  const { currentProfile } = useAppStore();

  const { setShowMobileDrawer, showMobileDrawer } = useGlobalModalStateStore();

  const Avatar = () => (
    <Image
      src={getAvatar(currentProfile as Profile)}
      className="h-8 w-8 cursor-pointer rounded-full border dark:border-gray-700"
      alt={currentProfile?.id}
    />
  );

  const openMobileMenuDrawer = () => {
    setShowMobileDrawer(true);
  };

  return (
    <>
      {showMobileDrawer ? <MobileDrawerMenu /> : null}
      <button
        className="focus:outline-none md:hidden"
        onClick={() => openMobileMenuDrawer()}
      >
        <Avatar />
      </button>
      <Menu as="div" className="hidden md:block">
        <MenuButton className="flex self-center">
          <Avatar />
        </MenuButton>
        <MenuTransition>
          <MenuItems
            static
            className="absolute right-0 mt-2 w-48 rounded-xl border bg-white py-1 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-black"
          >
            <MenuItem
              as={NextLink}
              href={getProfile(currentProfile).link}
              className="m-2 flex items-center rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <div className="flex w-full flex-col">
                <div>Logged in as</div>
                <div className="truncate">
                  <Slug
                    className="font-bold"
                    slug={getProfile(currentProfile).slugWithPrefix}
                  />
                </div>
              </div>
            </MenuItem>
            <div className="divider" />
            <MenuItem
              as="div"
              className={({ active }: { active: boolean }) =>
                cn(
                  { 'dropdown-active': active },
                  'm-2 rounded-lg border dark:border-gray-700'
                )
              }
            >
              <SwitchProfile />
            </MenuItem>
            <div className="divider" />
            <MenuItem
              as={NextLink}
              href={getProfile(currentProfile).link}
              className={({ active }: { active: boolean }) =>
                cn({ 'dropdown-active': active }, 'menu-item')
              }
            >
              <YourProfile />
            </MenuItem>
            <MenuItem
              as={NextLink}
              href="/settings"
              className={({ active }: { active: boolean }) =>
                cn({ 'dropdown-active': active }, 'menu-item')
              }
            >
              <Settings />
            </MenuItem>
            {currentProfile?.ownedBy.address === ADMIN_ADDRESS ||
            ADMIN_ADDRESS2 ||
            ADMIN_ADDRESS3 ? (
              <MenuItem
                as={NextLink}
                href="/mod"
                className={({ active }: { active: boolean }) =>
                  cn({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <Mod />
              </MenuItem>
            ) : null}
           
            <MenuItem
              as="div"
              className={({ active }) =>
                cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
              }
            >
              <Logout />
            </MenuItem>
            <div className="divider" />
            <MenuItem
              as="div"
              className={({ active }) =>
                cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
              }
            >
              <ThemeSwitch />
            </MenuItem>

            <div className="divider" />
            <AppVersion />
          </MenuItems>
        </MenuTransition>
      </Menu>
    </>
  );
};

export default SignedUser;
