import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { FC, ReactNode } from 'react';
import React from 'react';

interface DropdownProps {
  triggerChild: JSX.Element;
  children: ReactNode;
}

const Dropdown: FC<DropdownProps> = ({ children, triggerChild }) => {
  return (
    <Menu>
      <MenuButton>{triggerChild}</MenuButton>
      <MenuItems className="absolute z-10">
        <MenuItem disabled>{children}</MenuItem>
      </MenuItems>
    </Menu>
  );
};
export default Dropdown;
