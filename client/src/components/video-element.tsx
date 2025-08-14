import { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface VideoElementProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  isMuted?: boolean;
  userName?: string;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
  className?: string;
}

export function VideoElement({ 
  stream, 
  isLocal = false, 
  isMuted = false,
  userName = "User", 
  isVideoEnabled = true,
  isScreenSharing = false,
  className = "" 
}: VideoElementProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && isVideoEnabled;
  const gradientClass = isLocal 
    ? "from-green-600 to-blue-600" 
    : "from-blue-900 via-purple-900 to-indigo-900";

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-900 ${className}`}>
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <div className="text-white text-center">
            <div className={`${isLocal ? 'w-16 h-16' : 'w-24 h-24'} bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm`}>
              <User size={isLocal ? 32 : 48} />
            </div>
            <h3 className={`${isLocal ? 'text-sm' : 'text-xl'} font-semibold mb-2`}>
              {userName}
            </h3>
            {!isLocal && (
              <p className="text-gray-300 text-sm">
                {!stream ? "Connecting..." : !isVideoEnabled ? "Camera is off" : "Video Loading..."}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Connection status for remote */}
      {!isLocal && stream && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-white text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{isScreenSharing ? "Screen Share" : "HD Video"}</span>
          </div>
        </div>
      )}
      
      {/* Muted indicator */}
      {!isVideoEnabled && (
        <div className="absolute top-4 right-4 bg-red-600 bg-opacity-90 backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-white text-xs font-medium">Camera Off</span>
        </div>
      )}
    </div>
  );
}