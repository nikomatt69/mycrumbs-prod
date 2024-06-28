import MetaTags from '@components/Common/MetaTags';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useDisplayName } from '@huddle01/react/app-utils';
import {

  
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,

} from '@huddle01/react/hooks';
import { APP_NAME, STATIC_ASSETS_URL } from '@lensshare/data/constants';
import cn from '@lensshare/ui/cn';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import { useAppStore } from 'src/store/persisted/useAppStore';
import { useUpdateEffect } from 'usehooks-ts';

import { useMeetPersistStore } from 'src/store/persisted/meet';

import { AccessToken, Role } from "@huddle01/server-sdk/auth";
type Props = {
  token: string;
};

export default function Lobby({ token }: Props) {
  const [displayName, setDisplayName] = useState<string>("");
  const { currentProfile } = useAppStore();
  const [displayUserName, setDisplayUserName] = useState<string>(
    currentProfile?.handle?.localName ?? ''
  );


  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();
  const { joinRoom, state } = useRoom({
    onJoin: (room) => {
      console.log("onJoin", room);
      updateMetadata({ displayName: displayUserName });
    },
    onPeerJoin: (peer) => {
      console.log("onPeerJoin", peer);
    },
  });
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { updateMetadata } = useLocalPeer<TPeerMetadata>();
  const { peerIds } = usePeerIds();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);


  return (
    <main className="bg-lobby flex my-36 flex-col items-center justify-center">
      <MetaTags title={`${APP_NAME} Meet`} />
    
        
          
        <div className="flex-1 justify-between items-center flex flex-col">
          <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
            <div className="relative flex gap-2">
              {isVideoOn && (
                <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                  <video
                    ref={videoRef}
                    className="aspect-video rounded-xl"
                    autoPlay
                    muted
                  />
                </div>
              )}
              {shareStream && (
                <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                  <video
                    ref={screenRef}
                    className="aspect-video rounded-xl"
                    autoPlay
                    muted
                  />
                </div>
              )}
            </div>
            <code className="font-mono font-bold">{state}</code>
          <div className="xs:w-[44vw] flex h-[36vh] items-center justify-center rounded-lg sm:w-[44vw] md:w-[44vw] ">
          {state === "idle" && (
            <>
              <input
                disabled={state !== "idle"}
                placeholder="Display Name"
                type="text"
                className="border-2 border-blue-400 rounded-lg p-2 mx-2 bg-black text-white"
                value={displayUserName}
                onChange={(event) => setDisplayName(event.target.value)}
              />

              <button
                disabled={!displayUserName}
                type="button"
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  await joinRoom({
                    roomId: router.query.roomId as string,
                    token,
                  });
                }}
              >
                Join Room
              </button>
            </>
          )}

          {state === "connected" && (
            <>
              <button
                type="button"
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  isVideoOn ? await disableVideo() : await enableVideo();
                }}
              >
                {isVideoOn ? "Disable Video" : "Enable Video"}
              </button>
              <button
                type="button"
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  isAudioOn ? await disableAudio() : await enableAudio();
                }}
              >
                {isAudioOn ? "Disable Audio" : "Enable Audio"}
              </button>
              <button
                type="button"
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  shareStream
                    ? await stopScreenShare()
                    : await startScreenShare();
                }}
              >
                {shareStream ? "Disable Screen" : "Enable Screen"}
              </button>
              <button
                type="button"
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  const status = isRecording
                    ? await fetch(
                        `/api/stopRecording?roomId=${router.query.roomId}`
                      )
                    : await fetch(
                        `/api/startRecording?roomId=${router.query.roomId}`
                      );

                  const data = await status.json();
                  console.log({ data });
                  setIsRecording(!isRecording);
                }}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
            </>
          )}
            <SwitchDeviceMenu />
          </div>
          </div>

          <div className="mt-8 mb-32 grid gap-2 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
            {peerIds.map((peerId) =>
              peerId ? <RemotePeer key={peerId} peerId={peerId} /> : null
            )}
          </div>
        </div>
        {state === "connected" && <ChatBox />}
     
    
    </main>
  );
};

import { GetServerSidePropsContext } from "next";
import { TPeerMetadata } from '@lensshare/types/hey';
import ChatBox from './ChatBox/ChatBox';
import RemotePeer from './RemotePeer/RemotePeer';
import SwitchDeviceMenu from './SwitchDeviceMenu';


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const accessToken = new AccessToken({
    apiKey: 'g6m5QybWE0XTq4drXk6k4rHxdCbIedsx' || "",
    roomId: ctx.params?.roomId?.toString() || "",
    role: Role.HOST,
    permissions: {
      admin: true,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
  });

  const token = await accessToken.toJwt();

  return {
    props: { token },
  };
};

