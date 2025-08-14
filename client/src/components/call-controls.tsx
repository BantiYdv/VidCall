import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MessageSquare, 
  MoreHorizontal, 
  PhoneOff 
} from 'lucide-react';

interface CallControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onMoreOptions: () => void;
  onLeaveCall: () => void;
  showChatButton?: boolean;
}

export function CallControls({
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onMoreOptions,
  onLeaveCall,
  showChatButton = false
}: CallControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white border-opacity-20">
          <div className="flex items-center justify-center space-x-4 p-4">
            {/* Audio Toggle */}
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleAudio}
              className={`w-14 h-14 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                isAudioMuted 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>

            {/* Video Toggle */}
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleVideo}
              className={`w-14 h-14 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                isVideoMuted 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </Button>

            {/* Screen Share */}
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleScreenShare}
              className={`w-14 h-14 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                isScreenSharing 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Monitor size={20} />
            </Button>

            {/* Chat Toggle (Mobile) */}
            {showChatButton && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleChat}
                className="w-14 h-14 bg-gray-600 hover:bg-gray-500 rounded-full transition-all transform hover:scale-105 shadow-lg text-white"
              >
                <MessageSquare size={20} />
              </Button>
            )}

            {/* More Options */}
            <Button
              variant="ghost"
              size="lg"
              onClick={onMoreOptions}
              className="w-14 h-14 bg-gray-600 hover:bg-gray-500 rounded-full transition-all transform hover:scale-105 shadow-lg text-white"
            >
              <MoreHorizontal size={20} />
            </Button>

            {/* Leave Call */}
            <Button
              variant="ghost"
              size="lg"
              onClick={onLeaveCall}
              className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full transition-all transform hover:scale-105 shadow-lg ml-4 text-white"
            >
              <PhoneOff size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
