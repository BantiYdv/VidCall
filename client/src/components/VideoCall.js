import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings,
  X,
  Users
} from 'lucide-react';

const VideoCall = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    initializeAgora();
    return () => {
      // Cleanup function to ensure proper disconnection
      if (client) {
        client.leave();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
    };
  }, []);

  const initializeAgora = async () => {
    try {
      setLoading(true);
      
      // Create Agora client
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);

      // Generate a unique UID for this session
      const uniqueUid = Math.floor(Math.random() * 1000000);

      // Get Agora token
      const tokenResponse = await axios.post('/api/agora/token', {
        channelName: roomId,
        uid: uniqueUid,
        role: 'publisher'
      });

      const { token, appID } = tokenResponse.data;

      // Join the channel
      await agoraClient.join(appID, roomId, token, uniqueUid);
      setIsCallActive(true);

      // Create and publish local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Publish local tracks
      await agoraClient.publish([audioTrack, videoTrack]);

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Handle remote user events
      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          setRemoteUsers(prev => [...prev, user]);
          if (remoteVideoRef.current) {
            user.videoTrack.play(remoteVideoRef.current);
          }
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });

      agoraClient.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      setLoading(false);
    } catch (error) {
      console.error('Error initializing Agora:', error);
      
      // Handle specific Agora errors
      if (error.message && error.message.includes('UID_CONFLICT')) {
        setError('Connection conflict. Please try again.');
      } else if (error.message && error.message.includes('INVALID_TOKEN')) {
        setError('Invalid token. Please check your Agora credentials.');
      } else {
        setError('Failed to join the call. Please try again.');
      }
      
      setLoading(false);
    }
  };

  const leaveCall = async () => {
    try {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (client) {
        await client.leave();
      }
      setIsCallActive(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      if (isAudioEnabled) {
        await localAudioTrack.setEnabled(false);
      } else {
        await localAudioTrack.setEnabled(true);
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      if (isVideoEnabled) {
        await localVideoTrack.setEnabled(false);
      } else {
        await localVideoTrack.setEnabled(true);
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Joining call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => {
                setError('');
                setLoading(true);
                initializeAgora();
              }} 
              className="btn-primary"
            >
              Retry Connection
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Live Call</span>
            <span className="text-gray-300 text-sm">Room: {roomId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">
              {remoteUsers.length + 1} participant{remoteUsers.length + 1 !== 1 ? 's' : ''}
            </span>
            <Users className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative h-screen">
        {/* Remote Video (Main) */}
        <div className="absolute inset-0">
          {remoteUsers.length > 0 ? (
            <div
              ref={remoteVideoRef}
              className="w-full h-full bg-gray-800"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-400">Waiting for other participant to join...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <div
            ref={localVideoRef}
            className="w-full h-full"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6 text-white" />
            ) : (
              <MicOff className="h-6 w-6 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6 text-white" />
            ) : (
              <VideoOff className="h-6 w-6 text-white" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={leaveCall}
            className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>

          {/* Settings */}
          <button className="h-12 w-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-colors">
            <Settings className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Call Status */}
      {isCallActive && (
        <div className="absolute top-16 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Connected
        </div>
      )}
    </div>
  );
};

export default VideoCall;
