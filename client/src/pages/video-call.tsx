import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import AgoraVideoCall from "@/components/AgoraVideoCall";

const config = {
  serverUrl: "", // Set your token server URL here
  proxyUrl: "",
  uid: Math.floor(Math.random() * 10000),
  tokenExpiryTime: 3600,
  rtcToken: null,
};

async function fetchRTCToken(channelName: string) {
  if (config.serverUrl !== "") {
    try {
      const response = await fetch(
        `${config.proxyUrl}${config.serverUrl}/rtc/${channelName}/publisher/uid/${config.uid}/?expiry=${config.tokenExpiryTime}`
      );
      const data = await response.json();
      console.log("[Token] RTC token fetched from server: ", data.rtcToken);
      return data.rtcToken;
    } catch (error) {
      console.error("[Token] Error fetching RTC token:", error);
      return null;
    }
  } else {
    console.log("[Token] Using static/null token");
    return config.rtcToken;
  }
}

export default function VideoCallPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [, setLocation] = useLocation();
  const [joinStatus, setJoinStatus] = useState<"pending" | "ok" | "full" | "error">("pending");
  const [participants, setParticipants] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    const joinRoom = async () => {
      setReady(false);
      setJoinStatus("pending");
      setErrorMsg("");
      console.log(`[Join] Attempting to join room: ${roomId}`);
      try {
        const res = await fetch(`/api/rooms/${roomId}/join`, { method: "POST" });
        const data = await res.json();
        console.log("[Join] Join response:", data);
        if (data.status === "ok") {
          setJoinStatus("ok");
          const tok = await fetchRTCToken(roomId);
          setToken(tok);
          if (!cancelled) setReady(true);
          fetchParticipants();
        } else {
          setJoinStatus("full");
          setErrorMsg("Room is full. Only two users allowed.");
          if (!cancelled) setReady(false);
        }
      } catch (err) {
        setJoinStatus("error");
        setErrorMsg("Failed to join room. Please check your network or try again later.");
        console.error("[Join] Error joining room:", err);
        if (!cancelled) setReady(false);
      }
    };
    joinRoom();
    let interval: any;
    if (joinStatus === "ok") {
      interval = setInterval(fetchParticipants, 2000);
    }
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [roomId]);

  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/rooms");
      const rooms = await res.json();
      const found = rooms.find((r: any) => r.id === roomId);
      if (found) {
        setParticipants(found.participants);
        console.log(`[Poll] Room ${roomId} has ${found.participants} participant(s)`);
      }
    } catch (err) {
      console.error("[Poll] Error fetching participants:", err);
    }
  };

  if (joinStatus === "pending" || !ready) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-xl">Joining room...</div>;
  }
  if (joinStatus === "full" || joinStatus === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-xl text-red-600">
        <div className="mb-4">{errorMsg}</div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setLocation("/")}>Go Back</button>
      </div>
    );
  }
  if (joinStatus === "ok" && ready && participants < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-xl">
        <div className="mb-4">Waiting for another user to join room <span className="font-mono font-bold">{roomId}</span>...</div>
        <div className="mb-4">Share this code: <span className="font-mono font-bold">{roomId}</span></div>
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setLocation("/")}>Leave Room</button>
      </div>
    );
  }
  if (joinStatus === "ok" && ready && participants === 2) {
    console.log(`[Call] Starting video call in room ${roomId} with token:`, token);
    return <AgoraVideoCall channelName={roomId} token={token} uid={config.uid} />;
  }
  return null;
}
