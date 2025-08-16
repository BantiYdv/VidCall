import { useEffect, useRef, useState, useCallback } from 'react';
import type { SocketMessage } from '@shared/schema';

const ICE_SERVERS = {
  iceServers: [
    { urls: ["stun:bn-turn1.xirsys.com"] },
    {
      username: "90XfnpAlrWkhJOCKYqT50iqR64plX07EJax_0KbpaKZJbLlXkBzvHp_2UPAcAV7dAAAAAGicP4diYW55ZHY=",
      credential: "a73535d0-7817-11f0-adac-0242ac140004",
      urls: [
        "turn:bn-turn1.xirsys.com:80?transport=udp",
        "turn:bn-turn1.xirsys.com:3478?transport=udp",
        "turn:bn-turn1.xirsys.com:80?transport=tcp",
        "turn:bn-turn1.xirsys.com:3478?transport=tcp",
        "turns:bn-turn1.xirsys.com:443?transport=tcp",
        "turns:bn-turn1.xirsys.com:5349?transport=tcp"
      ]
    }
  ]
};

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  initializeLocalStream: () => Promise<void>;
  handleSocketMessage: (message: SocketMessage) => void;
}

interface UseWebRTCProps {
  sendMessage: (message: SocketMessage) => void;
  userId: string;
}

export function useWebRTC({ sendMessage, userId }: UseWebRTCProps): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const originalStream = useRef<MediaStream | null>(null);

  const initializePeerConnection = useCallback(() => {
    if (peerConnection.current && peerConnection.current.connectionState !== 'closed') {
      return peerConnection.current;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'webrtc-ice-candidate',
          candidate: event.candidate.toJSON()
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote stream');
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState, 'Signaling state:', pc.signalingState);
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };

    peerConnection.current = pc;
    return pc;
  }, [sendMessage]);

  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      originalStream.current = stream;
      
      // Add tracks to peer connection
      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      console.log('Local stream initialized');
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [initializePeerConnection]);

  const createOffer = useCallback(async () => {
    const pc = peerConnection.current;
    if (!pc || pc.connectionState === 'closed' || pc.signalingState === 'closed') return;

    try {
      // Only create offer if we're in the right state
      if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
        console.log('Cannot create offer, signaling state:', pc.signalingState);
        return;
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      
      sendMessage({
        type: 'webrtc-offer',
        offer: offer
      });
      
      console.log('Offer sent');
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [sendMessage]);

  const handleSocketMessage = useCallback(async (message: SocketMessage) => {
    const pc = peerConnection.current;
    if (!pc || pc.connectionState === 'closed') return;

    try {
      switch (message.type) {
        case 'webrtc-offer':
          if (message.offer && pc.signalingState === 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            sendMessage({
              type: 'webrtc-answer',
              answer: answer
            });
            
            console.log('Answer sent');
          }
          break;
          
        case 'webrtc-answer':
          if (message.answer && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
            console.log('Answer received');
          }
          break;
          
        case 'webrtc-ice-candidate':
          if (message.candidate && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            console.log('ICE candidate added');
          }
          break;
      }
    } catch (error) {
      console.error('Error handling WebRTC message:', error);
      // Reset connection on error
      if (pc.connectionState === 'failed') {
        setTimeout(() => {
          if (localStream) {
            initializePeerConnection();
          }
        }, 1000);
      }
    }
  }, [sendMessage, localStream, initializePeerConnection]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (!peerConnection.current) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(true);
        setLocalStream(screenStream);
        
        // Handle screen share end
        videoTrack.addEventListener('ended', () => {
          toggleScreenShare(); // This will stop screen sharing
        });
        
      } else {
        // Stop screen sharing and return to camera
        if (originalStream.current) {
          const videoTrack = originalStream.current.getVideoTracks()[0];
          const sender = peerConnection.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
          
          setLocalStream(originalStream.current);
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [isScreenSharing]);

  // Initialize local stream when participants are present
  useEffect(() => {
    initializeLocalStream();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only trigger offer when we have local stream but no ongoing negotiation
  useEffect(() => {
    if (localStream && peerConnection.current && peerConnection.current.signalingState === 'stable') {
      // Small delay to ensure both users have initialized their streams
      const timer = setTimeout(() => {
        createOffer();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [localStream, createOffer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    initializeLocalStream,
    handleSocketMessage
  };
}