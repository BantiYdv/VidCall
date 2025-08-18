import React, { useState, useEffect } from "react";
import AgoraVideoCall from "@/components/AgoraVideoCall";

export default function VideoCallPage() {
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState("");
  const [error, setError] = useState("");

  // Fetch available rooms
  useEffect(() => {
    fetch("/api/rooms")
      .then(res => res.json())
      .then(data => setRooms(data.filter(room => room.participants < 2)));
  }, [joinedRoom]);

  // Create a new room
  const createRoom = async () => {
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newRoom }),
    });
    setJoinedRoom(newRoom);
  };

  // Join an existing room
  const joinRoom = async (roomId) => {
    const res = await fetch(`/api/rooms/${roomId}/join`, { method: "POST" });
    const data = await res.json();
    if (data.status === "ok") {
      setJoinedRoom(roomId);
      setError("");
    } else {
      setError("Room is full or join failed.");
    }
  };

  if (joinedRoom) {
    return <AgoraVideoCall channelName={joinedRoom} token={null} uid={Math.floor(Math.random() * 10000)} />;
  }

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      <h3>Available Rooms:</h3>
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            Room: {room.id} ({room.participants}/2)
            <button onClick={() => joinRoom(room.id)} disabled={room.participants >= 2}>
              Join
            </button>
          </li>
        ))}
      </ul>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
