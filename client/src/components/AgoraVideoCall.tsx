import React, { useEffect, useState } from "react";
import { useClient, useMicrophoneAndCameraTracks, appId } from "../agora/AgoraConfig";

export default function AgoraVideoCall({ channelName, token, uid }) {
  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [users, setUsers] = useState([]);

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
  }, [channelName, client, ready, tracks, token, uid]);

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
            key={user.uid}
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
