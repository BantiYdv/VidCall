import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings,
  Users,
  MessageSquare
} from 'lucide-react';

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const VideoCall = ({ user }) => {
  const { channel } = useParams();
  const navigate = useNavigate();
  
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [showControls, setShowControls] = useState(true);
  
  const localVideoRef = useRef();
  const localAudioTrack = useRef();
  const localVideoTrack = useRef();

  useEffect(() => {
    joinChannel();
    
    return () => {
      leaveChannel();
    };
  }, [channel]);

  const joinChannel = async () => {
    try {
      setLoading(true);
      setError('');

      // Get token from server
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/token?channel=${channel}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { token: rtcToken, appId } = response.data;

      // Join the channel
      await client.join(appId, channel, rtcToken, null);
      
      // Create and publish local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      localAudioTrack.current = audioTrack;
      localVideoTrack.current = videoTrack;
      
      await client.publish([audioTrack, videoTrack]);
      
      // Play local video
      videoTrack.play(localVideoRef.current);
      
      // Handle remote users
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-left", handleUserLeft);
      
      setJoined(true);
    } catch (error) {
      console.error('Error joining channel:', error);
      setError(error.response?.data?.error || 'Failed to join the call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    
    if (mediaType === "video") {
      setRemoteUsers(prev => [...prev, { ...user, hasVideo: true }]);
      user.videoTrack.play(`remote-video-${user.uid}`);
    }
    if (mediaType === "audio") {
      setRemoteUsers(prev => [...prev, { ...user, hasAudio: true }]);
      user.audioTrack.play();
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === "video") {
      setRemoteUsers(prev => prev.map(u => 
        u.uid === user.uid ? { ...u, hasVideo: false } : u
      ));
    }
    if (mediaType === "audio") {
      setRemoteUsers(prev => prev.map(u => 
        u.uid === user.uid ? { ...u, hasAudio: false } : u
      ));
    }
  };

  const handleUserLeft = (user) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const leaveChannel = async () => {
    try {
      if (localAudioTrack.current) {
        localAudioTrack.current.close();
      }
      if (localVideoTrack.current) {
        localVideoTrack.current.close();
      }
      await client.leave();
      setJoined(false);
      setRemoteUsers([]);
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack.current) {
      if (localAudioEnabled) {
        localAudioTrack.current.setEnabled(false);
        setLocalAudioEnabled(false);
      } else {
        localAudioTrack.current.setEnabled(true);
        setLocalAudioEnabled(true);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack.current) {
      if (localVideoEnabled) {
        localVideoTrack.current.setEnabled(false);
        setLocalVideoEnabled(false);
      } else {
        localVideoTrack.current.setEnabled(true);
        setLocalVideoEnabled(true);
      }
    }
  };

  const handleLeaveCall = () => {
    leaveChannel();
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Video Call - {channel}</h1>
            <p className="text-sm text-gray-300">
              {user.name} ({user.role}) • {joined ? 'Connected' : 'Connecting...'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{remoteUsers.length + 1} participant{remoteUsers.length !== 0 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Local Video */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <div ref={localVideoRef} className="w-full h-full" />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                You {!localVideoEnabled && '(Video Off)'}
              </div>
            </div>

            {/* Remote Videos */}
            {remoteUsers.length > 0 ? (
              remoteUsers.map((user) => (
                <div key={user.uid} className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <div id={`remote-video-${user.uid}`} className="w-full h-full" />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                    Remote User {!user.hasVideo && '(Video Off)'}
                  </div>
                </div>
              ))
            ) : (
              <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Waiting for others to join...</h3>
                  <p className="text-sm">Share the room name: <code className="bg-gray-700 px-2 py-1 rounded">{channel}</code></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                localAudioEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={localAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {localAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                localVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={localVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
            >
              {localVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>
            
            <button 
              onClick={handleLeaveCall}
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              title="Leave Call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
