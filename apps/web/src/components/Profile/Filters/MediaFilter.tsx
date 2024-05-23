import MenuTransition from '@components/Shared/MenuTransition';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import { Checkbox, Tooltip } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import type { ChangeEvent } from 'react';
import { useProfileFeedStore } from 'src/store/non-persisted/useProfileFeedStore';

const MediaFilter = () => {
  const { mediaFeedFilters, setMediaFeedFilters } = useProfileFeedStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMediaFeedFilters({
      ...mediaFeedFilters,
      [e.target.name]: e.target.checked
    });
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="rounded-md hover:bg-gray-300/20">
        <Tooltip placement="top" content="Filter">
          <AdjustmentsVerticalIcon className="text-brand h-5 w-5" />
        </Tooltip>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          static
          className="absolute right-0 z-[5] mt-1 rounded-xl border bg-white py-1 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <MenuItem
            as="label"
            className={({ active }) =>
              cn(
                { 'dropdown-active': active },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              onChange={handleChange}
              checked={mediaFeedFilters.images}
              name="images"
              label="Images"
            />
          </MenuItem>
          <MenuItem
            as="label"
            className={({ active }) =>
              cn(
                { 'dropdown-active': active },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              onChange={handleChange}
              checked={mediaFeedFilters.video}
              name="video"
              label="Video"
            />
          </MenuItem>
          <MenuItem
            as="label"
            className={({ active }) =>
              cn(
                { 'dropdown-active': active },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              onChange={handleChange}
              checked={mediaFeedFilters.audio}
              name="audio"
              label="Audio"
            />
          </MenuItem>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default MediaFilter;
