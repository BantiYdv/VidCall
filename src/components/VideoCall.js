import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';

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
      const response = await axios.get(`/api/rtc-token?channel=${channel}`, {
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
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>Joining call...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
            <button className="btn" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <h1>Video Call - {channel}</h1>
        <div className="user-info">
          <span>{user.name} ({user.role})</span>
          <span className="user-role">{joined ? 'Connected' : 'Connecting...'}</span>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="card">
            <div className="video-container">
              {/* Local Video */}
              <div className="video-wrapper">
                <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
                <div className="video-label">
                  You {!localVideoEnabled && '(Video Off)'}
                </div>
              </div>

              {/* Remote Videos */}
              {remoteUsers.length > 0 ? (
                remoteUsers.map((user) => (
                  <div key={user.uid} className="video-wrapper">
                    <div id={`remote-video-${user.uid}`} style={{ width: '100%', height: '100%' }} />
                    <div className="video-label">
                      Remote User {!user.hasVideo && '(Video Off)'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="video-wrapper" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f8f9fa',
                  color: '#666'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <h3>Waiting for others to join...</h3>
                    <p>Share the room name: <code>{channel}</code></p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="controls">
              <button 
                className={`control-btn ${!localAudioEnabled ? 'active' : ''}`}
                onClick={toggleAudio}
                title={localAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
              >
                {localAudioEnabled ? '🔊' : '🔇'}
              </button>
              
              <button 
                className={`control-btn ${!localVideoEnabled ? 'active' : ''}`}
                onClick={toggleVideo}
                title={localVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
              >
                {localVideoEnabled ? '📹' : '🚫'}
              </button>
              
              <button 
                className="control-btn btn-danger"
                onClick={handleLeaveCall}
                title="Leave Call"
              >
                📞
              </button>
            </div>

            {/* Status */}
            <div className={`status ${joined ? 'connected' : 'disconnected'}`}>
              {joined ? 'Connected to call' : 'Connecting...'}
              {remoteUsers.length > 0 && ` - ${remoteUsers.length} participant(s) joined`}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoCall;
