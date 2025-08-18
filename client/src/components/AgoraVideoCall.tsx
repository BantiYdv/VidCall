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
      <Basics appId={appId} channel={channelName} token={token} calling={calling} />
    </AgoraRTCProvider>
  );
}

function Basics({ appId, channel, token, calling }: { appId: string; channel: string; token: string | null; calling: boolean }) {
  useJoin({ appid: appId, channel, token: token ? token : null }, calling);

  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);
  const remoteUsers = useRemoteUsers();

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* Local user video */}
      <LocalUser
        audioTrack={localMicrophoneTrack}
        cameraOn={cameraOn}
        micOn={micOn}
        videoTrack={localCameraTrack}
        style={{ width: "50%", height: 300, background: "#222" }}
      />

      {/* Remote users video */}
      {remoteUsers.map((user) => (
        <div key={user.uid}>
          <RemoteUser user={user} style={{ width: "50%", height: 300, background: "#444" }}>
            <span>{user.uid}</span>
          </RemoteUser>
        </div>
      ))}

      {/* Controls */}
      <div>
        <button onClick={() => setMic((on) => !on)}>
          {micOn ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button onClick={() => setCamera((on) => !on)}>
          {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
        </button>
      </div>
    </div>
  );
}
