import { useCallback, useEffect, useRef, useState } from 'react';
import { SocketMessage } from '../../../shared/schema';

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

interface UseWebRTCProps {
  sendMessage: (message: SocketMessage) => void;
  participants: any[];
}

export function useWebRTCSimple({ sendMessage, participants }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const isInitiator = useRef(false);

  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
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
      console.log('Connection state:', pc.connectionState);
      setIsConnected(pc.connectionState === 'connected');
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
      console.log('Local stream initialized');

      const pc = createPeerConnection();
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [createPeerConnection]);

  const createOffer = useCallback(async () => {
    const pc = peerConnection.current;
    if (!pc || pc.signalingState !== 'stable') return;

    try {
      isInitiator.current = true;
      const offer = await pc.createOffer();
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
    if (!pc) return;

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
          if (message.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            console.log('ICE candidate added');
          }
          break;
      }
    } catch (error) {
      console.error('Error handling WebRTC message:', error);
    }
  }, [sendMessage]);

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

  // Initialize stream when component mounts
  useEffect(() => {
    initializeLocalStream();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create offer when second participant joins and we are first
  useEffect(() => {
    if (participants.length === 2 && localStream && !isInitiator.current) {
      setTimeout(() => {
        createOffer();
      }, 1000);
    }
  }, [participants.length, localStream, createOffer]);

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
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    initializeLocalStream,
    handleSocketMessage
  };
}