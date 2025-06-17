import { useEffect } from 'react';
import { connect, createLocalTracks } from 'twilio-video';
import axios from 'axios';

const useVideoCall = ({ activeChat, token, socket, setIsVideoCall, setPendingVideoToken }) => {

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

  // Initiate call: emits a request to the callee
  const initiateCall = ({ from, to, roomName }) => {
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

  // Join video room and attach tracks
  const joinVideoRoom = async (token) => {
    if (!token) return;

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
    const localContainer = document.getElementById('local-video');
    const remoteContainer = document.getElementById('remote-video');

    // Ensure the DOM containers exist before attaching tracks
    if (!localContainer || !remoteContainer) {
      console.warn('❌ Video containers not yet available. Deferring video attachment...');
      return;
    }

    const localEl = localTracks.find(t => t.kind === 'video')?.attach();
    if (localEl && localContainer) {
      localEl.style.width = '100%';
      localEl.style.height = '100%';
      localEl.style.objectFit = 'cover';
      localContainer.replaceChildren(localEl);
    }

    room.participants.forEach((participant) => {
      participant.tracks.forEach((publication) => {
        if (publication.track.kind === 'video') {
          const remoteEl = publication.track.attach();
          if (remoteContainer) {
            remoteEl.style.width = '100%';
            remoteEl.style.height = '100%';
            remoteEl.style.objectFit = 'cover';
            remoteContainer.replaceChildren(remoteEl);
          }
        }
      });
    });

    room.on('participantConnected', (participant) => {
      participant.on('trackSubscribed', (track) => {
        if (track.kind === 'video') {
          const remoteEl = track.attach();
          if (remoteContainer) {
            remoteEl.style.width = '100%';
            remoteEl.style.height = '100%';
            remoteEl.style.objectFit = 'cover';
            remoteContainer.replaceChildren(remoteEl);
          }
        }
      });
    });
  };

  // Leave the video room and cleanup
  const leaveVideoRoom = () => {
    const localContainer = document.getElementById('local-video');
    const remoteContainer = document.getElementById('remote-video');
    if (localContainer) localContainer.replaceChildren();
    if (remoteContainer) remoteContainer.replaceChildren();
    setIsVideoCall(false);
  };

  return { initiateCall, requestVideoTokenAndJoin, joinVideoRoom, leaveVideoRoom };
};

export default useVideoCall;
