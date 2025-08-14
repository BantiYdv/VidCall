import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useParams } from 'wouter';
import { ChatSidebar } from '@/components/chat-sidebar';
import { CallControls } from '@/components/call-controls';
import { VideoArea } from '@/components/video-area';
import { useSocket } from '@/hooks/use-socket';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Users } from 'lucide-react';
import type { Message, SocketMessage } from '@shared/schema';

export default function VideoCall() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Call state
  const [participantCount, setParticipantCount] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);
  const [callStartTime] = useState(Date.now());
  const [callDuration, setCallDuration] = useState('00:00:00');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser] = useState(() => `User${Math.floor(Math.random() * 1000)}`);
  const [remoteUser, setRemoteUser] = useState<string | null>(null);

  // Socket connection
  const { isConnected, sendMessage } = useSocket(handleSocketMessage);

  useEffect(() => {
    if (!roomId) {
      setLocation('/');
      return;
    }

    // Join room when component mounts
    if (isConnected) {
      sendMessage({
        type: 'join-room',
        roomId: roomId
      });
    }

    // Fetch existing messages
    fetchMessages();

    // Start call timer
    const timer = setInterval(() => {
      const elapsed = Date.now() - callStartTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      setCallDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => {
      clearInterval(timer);
      // Leave room when component unmounts
      if (isConnected) {
        sendMessage({
          type: 'leave-room',
          roomId: roomId
        });
      }
    };
  }, [roomId, isConnected]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      if (response.ok) {
        const fetchedMessages = await response.json();
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  function handleSocketMessage(message: SocketMessage) {
    switch (message.type) {
      case 'room-full':
        toast({
          title: "Room Full",
          description: "This room already has 2 participants.",
          variant: "destructive",
        });
        setLocation('/');
        break;
        
      case 'user-joined':
        if (message.participantCount) {
          setParticipantCount(message.participantCount);
          if (message.participantCount === 2) {
            setRemoteUser('Remote User');
            toast({
              title: "User Joined",
              description: "Another participant joined the call.",
            });
          }
        }
        break;
        
      case 'user-left':
        if (message.participantCount) {
          setParticipantCount(message.participantCount);
          setRemoteUser(null);
          toast({
            title: "User Left",
            description: "The other participant left the call.",
          });
        }
        break;
        
      case 'chat-message':
        if (message.sender && message.message && message.timestamp) {
          const newMessage: Message = {
            id: `msg_${Date.now()}`,
            roomId: roomId,
            sender: message.sender,
            content: message.message,
            timestamp: new Date(message.timestamp)
          };
          setMessages(prev => [...prev, newMessage]);
        }
        break;
    }
  }

  const handleSendMessage = (content: string) => {
    sendMessage({
      type: 'chat-message',
      roomId: roomId,
      sender: currentUser,
      content: content
    });
  };

  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    toast({
      title: isAudioMuted ? "Microphone Unmuted" : "Microphone Muted",
      description: isAudioMuted ? "Your microphone is now on" : "Your microphone is now off",
    });
  };

  const handleToggleVideo = () => {
    setIsVideoMuted(!isVideoMuted);
    toast({
      title: isVideoMuted ? "Camera On" : "Camera Off",
      description: isVideoMuted ? "Your camera is now on" : "Your camera is now off",
    });
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen Share Stopped" : "Screen Share Started",
      description: isScreenSharing ? "Screen sharing has been stopped" : "Screen sharing has been started",
    });
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleMoreOptions = () => {
    toast({
      title: "More Options",
      description: "Additional options coming soon!",
    });
  };

  const handleLeaveCall = () => {
    if (confirm('Are you sure you want to leave the call?')) {
      sendMessage({
        type: 'leave-room',
        roomId: roomId
      });
      setLocation('/');
    }
  };

  return (
    <div className="fixed inset-0 bg-google-dark">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm z-20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-white">
            <h3 className="font-semibold">Room: {roomId}</h3>
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <Users size={16} />
              <span>{participantCount}/2</span>
            </div>
            <div className="text-white text-sm font-mono">{callDuration}</div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="h-full flex relative">
        {/* Main Video Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Remote Video (Large) */}
          <div className="w-full h-full">
            <VideoArea
              isRemote={true}
              userName={remoteUser || "Waiting for participant..."}
              isVideoMuted={!remoteUser}
              className="w-full h-full"
            />
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-72 h-48 bg-gray-800 rounded-xl shadow-2xl border-2 border-white border-opacity-20 overflow-hidden">
            <VideoArea
              isRemote={false}
              userName="You"
              isVideoMuted={isVideoMuted}
              isAudioMuted={isAudioMuted}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Chat Sidebar */}
        {!isMobile && (
          <ChatSidebar
            roomId={roomId}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onSendMessage={handleSendMessage}
            messages={messages}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Mobile Chat Overlay */}
      {isMobile && isChatOpen && (
        <div className="fixed inset-0 bg-white z-50">
          <ChatSidebar
            roomId={roomId}
            isOpen={true}
            onClose={() => setIsChatOpen(false)}
            onSendMessage={handleSendMessage}
            messages={messages}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* Bottom Controls */}
      <CallControls
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        isScreenSharing={isScreenSharing}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleChat={handleToggleChat}
        onMoreOptions={handleMoreOptions}
        onLeaveCall={handleLeaveCall}
        showChatButton={isMobile}
      />
    </div>
  );
}
