import React, { useEffect, useState } from "react";
import { client, createMicrophoneAndCameraTracks, appId } from "../agora/AgoraConfig";
import type { IAgoraRTCRemoteUser, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-react";

interface AgoraVideoCallProps {
  channelName: string;
  token: string | null;
  uid: string | number;
}

export default function AgoraVideoCall({ channelName, token, uid }: AgoraVideoCallProps) {
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [tracks, setTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    createMicrophoneAndCameraTracks().then((createdTracks) => {
      if (isMounted) {
        setTracks(createdTracks as [IMicrophoneAudioTrack, ICameraVideoTrack]);
        setReady(true);
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let init = async () => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers) => [...prevUsers, user]);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user, type) => {
        if (type === "audio") {
          user.audioTrack?.stop();
        }
        if (type === "video") {
          setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        }
      });

      await client.join(appId, channelName, token || null, uid || null);
      if (tracks) await client.publish(tracks);
    };

    if (ready && tracks) {
      init();
    }

    return () => {
      client.leave();
      setUsers([]);
    };
  }, [channelName, ready, tracks, token, uid]);

  return (
    <div>
      <div>
        {/* Local video */}
        {ready && tracks && (
          <video
            ref={(el) => {
              if (el && tracks[1]) tracks[1].play(el);
            }}
            autoPlay
            playsInline
            style={{ width: "300px", height: "200px" }}
          />
        )}
      </div>
      <div>
        {/* Remote videos */}
        {users.map((user) => (
          <video
            key={String(user.uid)}
            ref={(el) => {
              if (el && user.videoTrack) user.videoTrack.play(el);
            }}
            autoPlay
            playsInline
            style={{ width: "300px", height: "200px" }}
          />
        ))}
      </div>
    </div>
  );
}
