import { Meta, StoryFn } from '@storybook/react';
import { Fragment } from 'react';
import { Modal } from '../Modal';  // Adjust the import path as necessary
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

import cn from '../../cn';
import { fn } from '@storybook/test';

export default {
  title: 'Components/Modal',
  component: Modal,
  args: { show: fn() },
  argTypes: {
    show: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
      mapping: {
        true: (show: any) => show,
        false: null
      },
    },
    children: {
      control: 'text',
      defaultValue: 'Content of the modal goes here.',
    },
    title: {
      control: 'text',
      defaultValue: 'Modal Title',
    },
    size: {
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg'] },
      defaultValue: 'sm',
    },
    icon: {
      control: 'boolean',
      defaultValue: false,
      mapping: {
        true: <XMarkIcon className="h-5 w-5 text-blue-500" />,
        false: null
      },
    },
    
  },
  tags: ['autodocs'],
 
  decorators: [(Story) => <Transition><Fragment>{Story()}</Fragment></Transition>],  // Using Fragment as a decorator for the story
} as Meta;

export const Template: StoryFn<React.ComponentProps<typeof Modal>> = (args) => <Modal   {...args}>
     <Transition.Root show={args.show} as={Fragment}>
      <Dialog open={args.show}      
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => args.onClose?.()}

      >
        <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500/75 transition-opacity dark:bg-gray-900/80" />
          </Transition.Child>
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={cn(
                { 'sm:max-w-5xl': args.size === 'lg' },
                { 'sm:max-w-3xl': args.size === 'md' },
                { 'sm:max-w-lg': args.size === 'sm' },
                { 'sm:max-w-sm': args.size === 'xs' },
                'inline-block w-full p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl'
              )}
            >
              <div className="flex items-center justify-between">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  {args.icon && args.icon}
                  {args.title}
                </Dialog.Title>
                <button
                  type="button"
                  className="p-2 -m-2 text-gray-400 bg-white rounded-full dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={args.onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2">
                {args.children}
              </div>
            </div>
           
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
</Modal>;

export const Default: StoryFn<React.ComponentProps<typeof Modal>> = (args) => <Modal {...args}/>;
Default.args = {
  show: true || false,
  title: 'Modal Title',
  onClose: () => console.log('Modal closed'),
};

export const WithIcon: StoryFn<React.ComponentProps<typeof Modal>> = (args) => <Modal {...args}/>;
WithIcon.args = {
  ...Default.args,
  icon: true,
  title: 'Modal with Icon',
};

export const Large: StoryFn<React.ComponentProps<typeof Modal>> = (args) => <Modal {...args}/>;
Large.args = {
  ...Default.args,
  size: 'md',
  title: 'Large Modal',
};