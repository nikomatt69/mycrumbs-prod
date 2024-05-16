/* eslint-disable react-hooks/rules-of-hooks */
import type { CachedConversation, CachedMessageWithId } from '@xmtp/react-sdk';
import type { Address } from 'viem';

import {
  useMessages,
  useStreamAllMessages,
  useStreamMessages
} from '@xmtp/react-sdk';
import {  memo , useEffect, useRef, useState } from 'react';
import type { ReactNode, FC } from 'react';

import Composer from '../Composer';
import Consent from './Consent';
import Messages from './Message';
import { useMessagesStore } from 'src/store/non-persisted/useMessagesStore';
import LazyDefaultProfile from '@components/Shared/LazyDefaultProfile';
import useSendMessage from 'src/hooks/useSendMessage';
import { useInView } from 'react-cool-inview';
import { formatDate, isOnSameDay } from 'src/hooks/formatTime5';
import cn from '@lensshare/ui/cn';
import { Virtuoso } from 'react-virtuoso';
interface DateDividerBorderProps {
  children: ReactNode;
}

const DateDividerBorder: FC<DateDividerBorderProps> = ({ children }) => (
  <>
    <div className="h-0.5 grow bg-gray-300/25" />
    {children}
    <div className="h-0.5 grow bg-gray-300/25" />
  </>
);

const DateDivider: FC<{ date?: Date }> = ({ date }) => (
  <div className="align-items-center flex items-center p-4 pl-2 pt-0">
    <DateDividerBorder>
      <span className="mx-11 flex-none text-sm font-bold text-gray-300">
        {formatDate(date)}
      </span>
    </DateDividerBorder>
  </div>
);

const MessagesList: FC = () => {
  const { selectedConversation } = useMessagesStore();
  const { messages } = useMessages(selectedConversation as CachedConversation);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedConversation) {
    return null;
  }
  const [page, setPage] = useState(1);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useStreamAllMessages();
  if (selectedConversation) {
    
    useStreamMessages(selectedConversation as CachedConversation);
  }
  const [show, setShow] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  return (
    <div >
      <div className="flex items-center justify-between px-5 py-1">
        <LazyDefaultProfile
          address={selectedConversation.peerAddress as Address}
        />
        <Consent address={selectedConversation.peerAddress as Address} />
      </div>
      <div className="divider" />
      <div
        className={cn(
          'h-[70vh] max-h-[70vh]',
          'flex flex-col-reverse space-y-5 overflow-y-auto p-5'
        )}
      >
        <div ref={endOfMessagesRef} />
        {[...messages].reverse().map((message) => (
          <Messages key={message.id} message={message} />
        ))}
      
      
      </div>
      <div className="divider" />
      <Composer conversation={selectedConversation} />
    </div>
  );
};

export default memo(MessagesList);

