import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect
} from 'react';
import io from 'socket.io-client';

const VideoContext = createContext();
export const useVideo = () => useContext(VideoContext);

/* reuse one getUserMedia() promise so the camera is opened only once */
let mediaPromise = null;

export const VideoProvider = ({ children }) => {
  /* global state */
  const [isLoading, setIsLoading] = useState(false);
  const [callState, setCallState] = useState('idle'); // idle | calling | incoming | in-call | error
  const [remoteUser, setRemoteUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState('');

  /* refs */
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  const incomingCallRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  /* ICE servers */
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ];

  /* ------------------------------------------------ getUserMedia */
  const getUserMedia = async () => {
    if (mediaPromise) return mediaPromise;

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    };

    mediaPromise = navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        setLocalStream(stream);
        return stream;
      })
      .catch(err => {
        mediaPromise = null; // allow retry
        throw err;
      });

    return mediaPromise;
  };

  /* ------------------------------------------------ createPeerConnection */
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = e => {
      if (e.candidate && remoteUser?.socketId) {
        socketRef.current.emit('ice-candidate', {
          targetSocketId: remoteUser.socketId,
          candidate: e.candidate
        });
      }
    };

    pc.ontrack = e => setRemoteStream(e.streams[0]);

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'connected') setCallState('in-call');
      if (st === 'failed' || st === 'disconnected') hangUp();
    };

    return pc;
  };

  /* ------------------------------------------------ ensureTracks */
  const ensureTracks = async () => {
    const stream = await getUserMedia();
    if (
      peerConnection.current &&
      peerConnection.current.getSenders().length === 0
    ) {
      stream.getTracks().forEach(t =>
        peerConnection.current.addTrack(t, stream)
      );
    }
  };

  /* ------------------------------------------------ Helper functions (defined before use) */
  const failCall = msg => {
    console.error(msg);
    setError(msg);
    setIsLoading(false);
    setCallState('error');
  };

  const resetState = () => {
    if (peerConnection.current) peerConnection.current.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());

    peerConnection.current = null;
    mediaPromise = null;
    setLocalStream(null);
    setRemoteStream(null);
    setRemoteUser(null);
    setCallState('idle');
    setError('');
    setIsLoading(false);
  };

  /* ------------------------------------------------ Socket event handlers (defined before use) */
  const handleIncomingCall = data => {
    incomingCallRef.current = data;
    setRemoteUser({ email: data.callerEmail, socketId: data.callerSocketId });
    setCallState('incoming');
    setError('');
  };

  const handleCallAnswered = data => {
    if (peerConnection.current) {
      peerConnection.current.setRemoteDescription(data.answer);
      setCallState('in-call');
    }
  };

  const handleCallRejected = data => {
    failCall(`Call rejected by ${data.rejectorEmail}`);
  };

  const handleReceiveOffer = async data => {
    try {
      peerConnection.current = createPeerConnection();
      await ensureTracks();

      await peerConnection.current.setRemoteDescription(data.offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        targetSocketId: data.from,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      failCall('Failed to handle incoming call');
    }
  };

  const handleReceiveAnswer = data => {
    if (peerConnection.current) {
      peerConnection.current.setRemoteDescription(data.answer);
    }
  };

  const handleIceCandidate = async data => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(data.candidate);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  /* ------------------------------------------------ Socket setup */
  useEffect(() => {
    socketRef.current = io('http://localhost:5000/video');

    socketRef.current.on('connect', () => {
      if (currentUser.email) {
        socketRef.current.emit('register-user', currentUser.email);
      }
    });

    /* Socket event listeners - now all handlers are defined above */
    socketRef.current.on('incoming-call', handleIncomingCall);
    socketRef.current.on('call-answered', handleCallAnswered);
    socketRef.current.on('call-rejected', handleCallRejected);
    socketRef.current.on('call-error', data => failCall(data.message));
    socketRef.current.on('receive-offer', handleReceiveOffer);
    socketRef.current.on('receive-answer', handleReceiveAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);
    socketRef.current.on('call-ended', hangUp);

    return () => {
      socketRef.current.disconnect();
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, []); // run once

  /* ------------------------------------------------ Main call functions */
  const callUser = async calleeEmail => {
    try {
      setIsLoading(true);
      setError('');
      setCallState('calling');
      setRemoteUser({ email: calleeEmail });

      peerConnection.current = createPeerConnection();
      await ensureTracks();

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socketRef.current.emit('call-user', {
        calleeEmail,
        callerEmail: currentUser.email,
        offer
      });

      setIsLoading(false);
    } catch (err) {
      failCall('Failed to start call');
    }
  };

  const answerCall = async () => {
    try {
      setIsLoading(true);
      peerConnection.current = createPeerConnection();
      await ensureTracks();

      await peerConnection.current.setRemoteDescription(
        incomingCallRef.current.offer
      );

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socketRef.current.emit('answer-call', {
        callerSocketId: incomingCallRef.current.callerSocketId,
        answer
      });

      setCallState('in-call');
      setIsLoading(false);
    } catch (err) {
      failCall('Failed to answer call');
    }
  };

  const rejectCall = () => {
    socketRef.current.emit('reject-call', {
      callerSocketId: incomingCallRef.current.callerSocketId
    });
    resetState();
  };

  const hangUp = () => {
    if (remoteUser?.socketId) {
      socketRef.current.emit('end-call', {
        targetSocketId: remoteUser.socketId
      });
    }
    resetState();
  };

  /* ------------------------------------------------ Toggle audio/video */
  const toggleAudio = () => {
    if (!localStream) return false;
    const track = localStream.getAudioTracks()[0];
    if (track) track.enabled = !track.enabled;
    return track ? track.enabled : false;
  };

  const toggleVideo = () => {
    if (!localStream) return false;
    const track = localStream.getVideoTracks()[0];
    if (track) track.enabled = !track.enabled;
    return track ? track.enabled : false;
  };

  /* ------------------------------------------------ Provide context */
  return (
    <VideoContext.Provider
      value={{
        callState,
        remoteUser,
        localStream,
        remoteStream,
        isLoading,
        error,
        callUser,
        answerCall,
        rejectCall,
        hangUp,
        toggleAudio,
        toggleVideo
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
