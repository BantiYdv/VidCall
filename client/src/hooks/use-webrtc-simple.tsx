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
  const hasCreatedOffer = useRef(false);
  const iceCandidateBuffer = useRef<any[]>([]);

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
        console.log('Sent ICE candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote stream', event.streams);
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setIsConnected(pc.connectionState === 'connected');
    };

    pc.onsignalingstatechange = () => {
      console.log('Signaling state:', pc.signalingState);
      // When remoteDescription is set, add any buffered ICE candidates
      if (pc.remoteDescription && iceCandidateBuffer.current.length > 0) {
        console.log('Adding buffered ICE candidates');
        iceCandidateBuffer.current.forEach(async candidate => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Buffered ICE candidate added', candidate);
          } catch (err) {
            console.error('Error adding buffered ICE candidate', err);
          }
        });
        iceCandidateBuffer.current = [];
      }
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
    if (!pc || hasCreatedOffer.current) return;
    try {
      isInitiator.current = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendMessage({
        type: 'webrtc-offer',
        offer: offer
      });
      hasCreatedOffer.current = true;
      console.log('Offer sent', offer);
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
            console.log('Offer received and set as remote description', message.offer);
            // Add any buffered ICE candidates
            if (iceCandidateBuffer.current.length > 0) {
              console.log('Adding buffered ICE candidates after offer');
              iceCandidateBuffer.current.forEach(async candidate => {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log('Buffered ICE candidate added', candidate);
                } catch (err) {
                  console.error('Error adding buffered ICE candidate', err);
                }
              });
              iceCandidateBuffer.current = [];
            }
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendMessage({
              type: 'webrtc-answer',
              answer: answer
            });
            console.log('Answer sent', answer);
          }
          break;
        case 'webrtc-answer':
          if (message.answer && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
            console.log('Answer received and set as remote description', message.answer);
            // Add any buffered ICE candidates
            if (iceCandidateBuffer.current.length > 0) {
              console.log('Adding buffered ICE candidates after answer');
              iceCandidateBuffer.current.forEach(async candidate => {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log('Buffered ICE candidate added', candidate);
                } catch (err) {
                  console.error('Error adding buffered ICE candidate', err);
                }
              });
              iceCandidateBuffer.current = [];
            }
          }
          break;
        case 'webrtc-ice-candidate':
          if (message.candidate) {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
              console.log('ICE candidate added', message.candidate);
            } else {
              // Buffer the candidate until remoteDescription is set
              iceCandidateBuffer.current.push(message.candidate);
              console.log('Buffered ICE candidate', message.candidate);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error handling WebRTC message:', error);
    }
  }, [sendMessage]);

  // Only the initiator (first user) creates the offer when both users are present
  useEffect(() => {
    if (participants.length === 2 && localStream && !isInitiator.current && !hasCreatedOffer.current) {
      setTimeout(() => {
        createOffer();
      }, 1000);
    }
  }, [participants.length, localStream, createOffer]);

  useEffect(() => {
    initializeLocalStream();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
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
    toggleVideo: () => {
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          setIsVideoEnabled(videoTrack.enabled);
        }
      }
    },
    toggleAudio: () => {
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setIsAudioEnabled(audioTrack.enabled);
        }
      }
    },
    initializeLocalStream,
    handleSocketMessage
  };
}