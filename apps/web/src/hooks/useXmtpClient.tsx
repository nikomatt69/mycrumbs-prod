import { Localstorage } from '@lensshare/data/storage';
import walletClient from '@lib/walletClient';
import { Client } from '@xmtp/xmtp-js';
import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from 'src/store/persisted/useAppStore';
import { useMessageStore } from 'src/store/messages';
import { APP_NAME, APP_VERSION, XMTP_ENV } from '@lensshare/data/constants';
import { ContentTypeReply, ReplyCodec } from "@xmtp/content-type-reply";
import { Address, useWalletClient } from 'wagmi';
import useEthersWalletClient from './useEthersWalletClient';
import { WalletClient } from 'viem';
import { AttachmentCodec, RemoteAttachmentCodec } from '@xmtp/content-type-remote-attachment';
import {
  ContentTypeTransactionReference,
  TransactionReferenceCodec,
} from "@xmtp/content-type-transaction-reference";
import { VoiceCodec } from './codecs/Audio';
import { VideoCodec } from './codecs/Video';
import { ImageCodec } from './codecs/Image';
const ENCODING = 'binary';

const buildLocalStorageKey = (walletAddress: string) =>
  `xmtp:${XMTP_ENV}:keys:${walletAddress}`;

const loadKeys = (walletAddress: string): Uint8Array | null => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

/**
 * Anyone copying this code will want to be careful about leakage of sensitive keys.
 * Make sure that there are no third party services, such as bug reporting SDKs or ad networks, exporting the contents
 * of your LocalStorage before implementing something like this.
 */
const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING)
  );
};

/**
 * This will clear the conversation cache + the private keys
 */
const wipeKeys = (walletAddress: string) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};

const useXmtpClient = (cacheOnly = false) => {
  const {currentProfile} = useAppStore();
  const client = useMessageStore((state) => state.client);
  const setClient = useMessageStore((state) => state.setClient);
  const [awaitingXmtpAuth, setAwaitingXmtpAuth] = useState<boolean>();

  const { data: wallet } = useWalletClient();

  useEffect(() => {
    const initXmtpClient = async () => {
      if (wallet && !client && currentProfile) {
        let keys = loadKeys(wallet.account.address);
        if (!keys) {
          if (cacheOnly) {
            return;
          }
          setAwaitingXmtpAuth(true);
          keys = await Client.getKeys( wallet as any , {
            env: XMTP_ENV,
            appVersion: APP_NAME + '/' + APP_VERSION,
            persistConversations: false,
            skipContactPublishing: true,
            codecs: [
              (new AttachmentCodec()),
              (new RemoteAttachmentCodec()),
              
         
              
            ]
          });
         
          storeKeys(wallet.account.address, keys);
        }

        const xmtp = await Client.create(null, {
          env: XMTP_ENV,
          appVersion: APP_NAME + '/' + APP_VERSION,
          privateKeyOverride: keys,
          persistConversations: true,
          codecs: [
            (new AttachmentCodec()),
            (new RemoteAttachmentCodec()),
            
       
            
          ]
        });

        setClient(xmtp);
        setAwaitingXmtpAuth(false);
      } else {
        setAwaitingXmtpAuth(false);
      }
    };
    initXmtpClient();
    if (!walletClient || !currentProfile?.handle) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setClient(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile?.handle]);

  return {
    client: client,
    loading: awaitingXmtpAuth
  };
};

export const useDisconnectXmtp = () => {
  const { data: walletClient } = useWalletClient();
  const client = useMessageStore((state) => state.client);
  const setClient = useMessageStore((state) => state.setClient);

  const disconnect = useCallback(async () => {
    if (walletClient) {
      wipeKeys(walletClient.account.address);
    }
    if (client) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setClient(undefined);
    }
    localStorage.removeItem(Localstorage.MessagesStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletClient, client]);

  return disconnect;
};

export default useXmtpClient;
