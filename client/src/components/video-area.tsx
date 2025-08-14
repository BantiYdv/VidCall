import { User } from 'lucide-react';

interface VideoAreaProps {
  isRemote?: boolean;
  userName?: string;
  isVideoMuted?: boolean;
  isAudioMuted?: boolean;
  className?: string;
}

export function VideoArea({ 
  isRemote = false, 
  userName = "User", 
  isVideoMuted = false,
  isAudioMuted = false,
  className = "" 
}: VideoAreaProps) {
  if (isRemote) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center relative ${className}`}>
        <div className="text-white text-center">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User size={48} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{userName}</h3>
          <p className="text-gray-300">
            {isVideoMuted ? "Camera is off" : "HD Video"}
          </p>
        </div>
        
        {/* Connection status overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-white text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>HD Quality</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center relative ${className}`}>
      <div className="text-white text-center">
        <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-2">
          <User size={32} />
        </div>
        <p className="text-sm font-medium">{userName}</p>
      </div>
      
      {/* Local video controls overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
        <button className={`bg-black bg-opacity-50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white hover:bg-opacity-70 transition-all ${isAudioMuted ? 'bg-red-600' : ''}`}>
          <i className={`fas ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xs`}></i>
        </button>
        <button className={`bg-black bg-opacity-50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white hover:bg-opacity-70 transition-all ${isVideoMuted ? 'bg-red-600' : ''}`}>
          <i className={`fas ${isVideoMuted ? 'fa-video-slash' : 'fa-video'} text-xs`}></i>
        </button>
      </div>
    </div>
  );
}
