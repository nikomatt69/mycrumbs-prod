import Markup from '@components/Shared/Markup';
import type { Profile } from '@lensshare/lens';
import type { DecodedMessage } from '@xmtp/xmtp-js';
import type { FC, ReactNode } from 'react';
import { useRef } from 'react';
import {
  type FailedMessage,
  isQueuedMessage,
  type PendingMessage
} from 'src/hooks/useSendOptimisticMessage';
import { ContentTypeRemoteAttachment } from 'xmtp-content-type-remote-attachment';

import RemoteAttachmentPreview from './RemoteAttachmentPreview';
import { ContentTypeAttachment } from '@xmtp/content-type-remote-attachment';
import { ContentTypeAudioeKey } from 'src/hooks/codecs/Audio';
import { ContentTypeVideoKey } from 'src/hooks/codecs/Video';
import { ContentTypeImageKey } from 'src/hooks/codecs/Image';
import { ContentTypeReply } from '@xmtp/content-type-reply';
import { ContentTypeTransactionReference } from '@xmtp/content-type-transaction-reference';

interface MessageContentProps {
  message: DecodedMessage | PendingMessage | FailedMessage;
  profile: Profile | undefined;
  sentByMe: boolean;
}

const MessageContent: FC<MessageContentProps> = ({
  message,
  profile,
  sentByMe
  
}) => {
  const previewRef = useRef<ReactNode | undefined>();

  if (message.error) {
    return <span>Error: {`${message.error}`}</span>;
  }

  const hasQueuedMessagePreview = isQueuedMessage(message);

  // if message is pending, render a custom preview if available
  if (hasQueuedMessagePreview && message.render) {
    if (!previewRef.current) {
      // store the message preview so that RemoteAttachmentPreview
      // has access to it
      previewRef.current = message.render;
    }
    return previewRef.current;
  }

  if (message.contentType.sameAs(ContentTypeAttachment)) {
    return (
      <RemoteAttachmentPreview
        remoteAttachment={message.content}
        profile={profile}
        sentByMe={sentByMe}
        preview={previewRef.current}
      />
    );
  }

  if (message.contentType.sameAs(ContentTypeAudioeKey)) {
    return (
      <div className="max-w-20">
        <audio controls>
          <source src={message.content} type='audio/mpeg' />
        </audio>
      </div>
    );
  }

  
  
  
  

  return <Markup>{message.content}</Markup>;
};

export default MessageContent;
