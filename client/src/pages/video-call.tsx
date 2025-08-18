import { useState } from 'react';
import { useParams } from 'wouter';
import AgoraVideoCall from "@/components/AgoraVideoCall";

export default function VideoCall() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [currentUser] = useState(() => `User${Math.floor(Math.random() * 1000)}`);

  return (
    <div>
      <AgoraVideoCall channelName={roomId} token={null} uid={currentUser} />
      {/* You can keep your chat and other UI as needed */}
    </div>
  );
}
