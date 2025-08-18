import React, { useState } from "react";
import AgoraVideoCall from "@/components/AgoraVideoCall";

export default function VideoCallPage() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const createRoom = () => {
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom(newRoom);
    setJoined(false);
    setError("");
  };

  const joinRoom = async () => {
    // Call your backend to check/join room
    try {
      const res = await fetch(`/api/rooms/${room}/join`, { method: "POST" });
      const data = await res.json();
      if (data.status === "ok") {
        setJoined(true);
        setError("");
      } else if (data.status === "full") {
        setError("Room is full. Only two users allowed.");
      } else {
        setError("Failed to join room.");
      }
    } catch (e) {
      setError("Failed to join room.");
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
          />
          <button onClick={joinRoom}>Join Room</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
      ) : (
        <AgoraVideoCall channelName={room} token={null} uid={Math.floor(Math.random() * 10000)} />
      )}
    </div>
  );
}
