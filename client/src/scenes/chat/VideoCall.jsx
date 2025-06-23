import { useEffect, useState, useRef } from 'react';
import { connect, createLocalTracks } from 'twilio-video';
import axios from 'axios';

const useVideoCall = ({ activeChat, token, socket, setIsVideoCall, setPendingVideoToken }) => {
  const [isDOMReady, setIsDOMReady] = useState(false); // Track DOM readiness

  // Use refs to access video containers directly
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Check if video containers are available in the DOM after component mounts
  useEffect(() => {
    // Checking DOM readiness once after the component mounts
    if (localVideoRef.current && remoteVideoRef.current) {
      setIsDOMReady(true); // DOM is ready
      console.log('✅ DOM is ready: Video containers available');
    } else {
      console.warn('❌ Video containers not available yet');
    }
  }, []);

  // Handler for when a call is accepted
  useEffect(() => {
    const handleCallAccepted = ({ roomName }) => {
      requestVideoTokenAndJoin(roomName);
    };

    socket?.on('call_accepted', handleCallAccepted);

    return () => {
      socket?.off('call_accepted', handleCallAccepted);
    };
  }, [socket]);

  // Initiate a call: Emits a request to the callee
  const initiateCall = ({ from, to, roomName }) => {
    if (!socket) {
      console.error('Socket is not initialized.');
      return;
    }
    socket.emit('call_user', { from, to, roomName });
  };

  // Fetch video token and join the room (deferred until DOM is ready)
  const requestVideoTokenAndJoin = async (roomName) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/video/token`,
        { roomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingVideoToken(response.data.token); // Store the token before joining
    } catch (err) {
      console.error('Error fetching video token:', err);
    }
  };

  // Join video room and attach tracks after DOM is ready
  const joinVideoRoom = async (token) => {
    if (!token || !isDOMReady) {
      console.warn('❌ Cannot join video room: Token is missing or DOM is not ready.');
      return;
    }

    try {
      // Create local tracks (audio & video)
      const localTracks = await createLocalTracks({ audio: true, video: true });

      const room = await connect(token, {
        name: activeChat?._id || 'defaultRoom',
        tracks: localTracks,
      });

      setIsVideoCall(true);
      attachTracks(room, localTracks);
    } catch (error) {
      console.error('❌ Error joining Twilio room:', error);
    }
  };

  // Attach local and remote video tracks to the DOM
  const attachTracks = (room, localTracks) => {
    if (!localVideoRef.current || !remoteVideoRef.current) {
      console.warn('❌ Video containers not available yet. Deferring video attachment...');
      return;
    }

    const localEl = localTracks.find(t => t.kind === 'video')?.attach();
    if (localEl && localVideoRef.current) {
      localEl.style.width = '100%';
      localEl.style.height = '100%';
      localEl.style.objectFit = 'cover';
      localVideoRef.current.replaceChildren(localEl);
    }

    room.participants.forEach((participant) => {
      participant.tracks.forEach((publication) => {
        if (publication.track.kind === 'video') {
          const remoteEl = publication.track.attach();
          if (remoteVideoRef.current) {
            remoteEl.style.width = '100%';
            remoteEl.style.height = '100%';
            remoteEl.style.objectFit = 'cover';
            remoteVideoRef.current.replaceChildren(remoteEl);
          }
        }
      });
    });

    room.on('participantConnected', (participant) => {
      participant.on('trackSubscribed', (track) => {
        if (track.kind === 'video') {
          const remoteEl = track.attach();
          if (remoteVideoRef.current) {
            remoteEl.style.width = '100%';
            remoteEl.style.height = '100%';
            remoteEl.style.objectFit = 'cover';
            remoteVideoRef.current.replaceChildren(remoteEl);
          }
        }
      });
    });
  };

  // Leave the video room and cleanup
  const leaveVideoRoom = () => {
    if (localVideoRef.current) localVideoRef.current.replaceChildren();
    if (remoteVideoRef.current) remoteVideoRef.current.replaceChildren();
    setIsVideoCall(false);
  };

  return { initiateCall, requestVideoTokenAndJoin, joinVideoRoom, leaveVideoRoom };
};

export default useVideoCall;
