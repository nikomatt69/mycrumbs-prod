
import { useLocalPeer } from '@huddle01/react/hooks';
import { TMessage } from './ChatBox';
import { TPeerMetadata } from '@lensshare/types/hey';

interface Props {
  message: TMessage;
}

function LocalMessageBubble({ message }: Props) {
  const { metadata } = useLocalPeer<TPeerMetadata>();

  return (
    <div className="w-full items-end flex flex-col bg-white rounded-lg">
      <span className="text-white text-sm">{message.text}</span>
    </div>
  );
}

export default LocalMessageBubble;
