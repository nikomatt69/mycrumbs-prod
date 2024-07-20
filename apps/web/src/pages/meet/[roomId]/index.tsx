import {
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "next-themes";

import { useAppStore } from "src/store/persisted/useAppStore";
import MetaTags from "@components/Common/MetaTags";
import { APP_NAME } from "@lensshare/data/constants";
import SwitchDeviceMenu from "@components/Meet/SwitchDeviceMenu";
import RemotePeer from "@components/Meet/RemotePeer/RemotePeer";
import ChatBox from "@components/Meet/ChatBox/ChatBox";

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
  const { joinRoom, state, leaveRoom } = useRoom({
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
    <main className="bg-lobby flex  flex-col items-center ">
      <MetaTags title={`${APP_NAME} Meet`} />
      <div className="flex h-[85vh] w-[85vw] flex-col items-center gap-2 pt-10 relative ">
        <div className="absolute bottom-4 right-4 w-24 h-36 rounded-lg border-2 border-blue-400 ">
          {isVideoOn && (
            <video
              ref={videoRef}
              className="w-full h-full rounded-lg"
              autoPlay
              playsInline
              
              muted
            />
          )}
        </div>
        <div className=" flex items-center pt-6 rounded-xl justify-center">
          {shareStream && (
            <video
              ref={screenRef}
              className=" rounded-lg"
              autoPlay
              playsInline
              
              muted
            />
          )}
         
       
        </div>
        <div className="flex items-center rounded-xl h-full w-full justify-center">
        {peerIds.map((peerId) =>
            peerId ? <RemotePeer key={peerId} peerId={peerId} /> : null
          )}
          </div>
      </div>
      <code className="font-mono text-xs font-bold">{state}</code>
      <div className="flex-1 justify-between z-[10] mb-10 cursor-pointer items-center flex ">
        {state === "idle" && (
          <>
            <input
              disabled={state !== "idle"}
              placeholder="Display Name"
              type="text"
              className="border-2 border-blue-400 rounded-lg p-2 mx-2  bg-black text-white"
              value={displayUserName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <button
              disabled={!displayUserName}
              type="button"
              className="bg-blue-500 text-xs cursor-pointer p-2 mx-2 rounded-lg"
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
              onClick={async () => {
                await leaveRoom();
              }}
              className="bg-blue-500 p-2 mx-1 text-xs rounded-lg"
            >
              Leave
            </button>
            <button
              type="button"
              className="bg-blue-500 p-2 mx-1 text-xs rounded-lg"
              onClick={async () => {
                isVideoOn ? await disableVideo() : await enableVideo();
              }}
            >
              {isVideoOn ? <VideoCameraSlashIcon className="h-4 w-4" /> : <VideoCameraIcon className="h-4 w-4"/> }
            </button>
            <button
              type="button"
              className="bg-blue-500 p-2 mx-1 text-xs rounded-lg"
              onClick={async () => {
                isAudioOn ? await disableAudio() : await enableAudio();
              }}
            >
              {isAudioOn ? <XCircleIcon className="h-4 w-4"/>: <MicrophoneIcon className="h-4 w-4"/>}
            </button>
            <button
              type="button"
              className="bg-blue-500 p-2 mx-1 text-xs rounded-lg"
              onClick={async () => {
                shareStream ? await stopScreenShare() : await startScreenShare();
              }}
            >
              {shareStream ? "Disable Screen" : <PhotoIcon className="h-4 w-4"/>}
            </button>
            <button
              type="button"
              className="bg-blue-500 p-2 text-xs mx-1 rounded-lg"
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
              {isRecording ? "Stop " : <StreamOutline className="h-4 w-4"/>}
            </button>
          </>
        )}
        <SwitchDeviceMenu />
      </div>
    </main>
  );
};

import { GetServerSidePropsContext } from "next";
import { TPeerMetadata } from '@lensshare/types/hey';
import { MicrophoneIcon, PhotoIcon, RectangleStackIcon, VideoCameraIcon, VideoCameraSlashIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import StreamOutline from "@components/Icons/StreamOutline";

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