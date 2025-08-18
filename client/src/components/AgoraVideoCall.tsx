import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { useState } from "react";

interface AgoraVideoCallProps {
  channelName: string;
  token: string | null;
  uid: string | number;
}

export default function AgoraVideoCall({ channelName, token, uid }: AgoraVideoCallProps) {
  const appId = "a32fa0ab368c43aa85985bb65628111f";
  const [calling] = useState(true);
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallUI appId={appId} channel={channelName} token={token} calling={calling} uid={uid} />
    </AgoraRTCProvider>
  );
}

function VideoCallUI({ appId, channel, token, calling, uid }: any) {
  useJoin({ appid: appId, channel, token: token ? token : null, uid }, calling);

  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);
  const remoteUsers = useRemoteUsers();

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      {/* Remote video (full screen) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <RemoteUser
              key={user.uid}
              user={user}
              style={{
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
                background: "#222",
              }}
            >
              <span className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                Remote User
              </span>
            </RemoteUser>
          ))
        ) : (
          <div className="text-white text-2xl">Waiting for another user to join...</div>
        )}
      </div>

      {/* Local video (picture-in-picture) */}
      <div className="absolute bottom-24 right-8 w-48 h-32 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-black">
        <LocalUser
          audioTrack={localMicrophoneTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          videoTrack={localCameraTrack}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#222",
          }}
        >
          <span className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
            You
          </span>
        </LocalUser>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
        <button
          className={`rounded-full w-14 h-14 flex items-center justify-center bg-white shadow-lg ${
            micOn ? "" : "bg-red-500 text-white"
          }`}
          onClick={() => setMic((on) => !on)}
        >
          {micOn ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1v14m0 0a5 5 0 0 0 5-5V6a5 5 0 0 0-10 0v4a5 5 0 0 0 5 5z" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l22 22M9 9v2a3 3 0 0 0 6 0v-2M12 19v2m-6-2a6 6 0 0 0 12 0" />
            </svg>
          )}
        </button>
        <button
          className={`rounded-full w-14 h-14 flex items-center justify-center bg-white shadow-lg ${
            cameraOn ? "" : "bg-red-500 text-white"
          }`}
          onClick={() => setCamera((on) => !on)}
        >
          {cameraOn ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="15" height="10" rx="2" />
              <path d="M17 7l5 5-5 5V7z" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="15" height="10" rx="2" />
              <path d="M17 7l5 5-5 5V7zM1 1l22 22" />
            </svg>
          )}
        </button>
        <button
          className="rounded-full w-14 h-14 flex items-center justify-center bg-red-600 text-white shadow-lg"
          onClick={() => window.location.href = '/'}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
