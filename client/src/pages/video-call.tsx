import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import AgoraVideoCall from "@/components/AgoraVideoCall";

export default function VideoCallPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [, setLocation] = useLocation();
  const [joinStatus, setJoinStatus] = useState<"pending" | "ok" | "full">("pending");
  const [participants, setParticipants] = useState(1);

  // Try to join the room on mount
  useEffect(() => {
    const joinRoom = async () => {
      const res = await fetch(`/api/rooms/${roomId}/join`, { method: "POST" });
      const data = await res.json();
      if (data.status === "ok") {
        setJoinStatus("ok");
        fetchParticipants();
      } else {
        setJoinStatus("full");
      }
    };
    joinRoom();
    // Poll for participants if joined
    let interval: any;
    if (joinStatus === "ok") {
      interval = setInterval(fetchParticipants, 2000);
    }
    return () => interval && clearInterval(interval);
    // eslint-disable-next-line
  }, [roomId, joinStatus]);

  // Fetch participant count
  const fetchParticipants = async () => {
    const res = await fetch("/api/rooms");
    const rooms = await res.json();
    const found = rooms.find((r: any) => r.id === roomId);
    if (found) setParticipants(found.participants);
  };

  if (joinStatus === "pending") {
    return <div className="flex flex-col items-center justify-center min-h-screen text-xl">Joining room...</div>;
  }
  // if (joinStatus === "full") {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-xl">
  //       <div className="mb-4">Room Full. Only two users allowed.</div>
  //       <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setLocation("/")}>Go Back</button>
  //     </div>
  //   );
  // }
  if (joinStatus === "ok" && participants < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-xl">
        <div className="mb-4">Waiting for another user to join room <span className="font-mono font-bold">{roomId}</span>...</div>
        <div className="mb-4">Share this code: <span className="font-mono font-bold">{roomId}</span></div>
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setLocation("/")}>Leave Room</button>
      </div>
    );
  }
  // Both users are present, start the call
  return <AgoraVideoCall channelName={roomId} token={null} uid={Math.floor(Math.random() * 10000)} />;
}
