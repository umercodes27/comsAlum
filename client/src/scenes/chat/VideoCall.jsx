import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { createLocalTracks, connect } from 'twilio-video';

const useVideoCall = ({ activeChat, token, socket, setIsVideoCall, setPendingVideoToken }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const roomRef = useRef(null);
  const localTracksRef = useRef(null);

  const initiateCall = ({ from, to, roomName }) => {
    if (!socket?.connected) {
      console.error('Socket not connected.');
      return false;
    }
    socket.emit('call_user', { from, to, roomName });
    return true;
  };

  const requestVideoTokenAndJoin = async (roomName) => {
    if (!roomName) {
      console.error('Error: roomName missing');
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/video/token`,
        { roomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const videoToken = response.data.token;
      console.log('Token received:', videoToken);
      if (videoToken) setPendingVideoToken(videoToken);
    } catch (err) {
      console.error('Error fetching token:', err.message);
      setIsVideoCall(false);
    }
  };

  const joinVideoRoom = async (videoToken, roomName) => {
    if (!videoToken) {
      console.warn('No token provided');
      return;
    }
    try {
      // Start camera/mic immediately
      const localTracks = await createLocalTracks({ audio: true, video: true });
      localTracksRef.current = localTracks;

      const room = await connect(videoToken, {
        name: roomName || activeChat?._id || `room-${Date.now()}`,
        tracks: localTracks,
      });
      roomRef.current = room;

      // Attach tracks once DOM is ready
      const attachTracks = () => {
        if (!localVideoRef.current || !remoteVideoRef.current) {
          console.warn('DOM not ready, retrying in 500ms...');
          return false;
        }
        const localVideoTrack = localTracks.find((t) => t.kind === 'video');
        if (localVideoTrack) {
          const localEl = localVideoTrack.attach();
          localEl.style.width = '100%';
          localEl.style.height = '100%';
          localEl.style.objectFit = 'cover';
          localVideoRef.current.replaceChildren(localEl);
        }
        room.participants.forEach((participant) => {
          participant.tracks.forEach((publication) => {
            if (publication.track?.kind === 'video') {
              const remoteEl = publication.track.attach();
              remoteEl.style.width = '100%';
              remoteEl.style.height = '100%';
              remoteEl.style.objectFit = 'cover';
              remoteVideoRef.current.replaceChildren(remoteEl);
            }
          });
        });
        return true;
      };

      // Retry attaching tracks
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        if (attachTracks()) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
        console.log(`Attach attempt ${attempts + 1}: localVideoRef=${!!localVideoRef.current}, remoteVideoRef=${!!remoteVideoRef.current}`);
      }
      if (attempts >= maxAttempts) {
        console.error('Failed to attach tracks: DOM not ready after retries');
        leaveVideoRoom();
        return;
      }

      room.on('participantConnected', (participant) => {
        participant.on('trackSubscribed', (track) => {
          if (track.kind === 'video' && remoteVideoRef.current) {
            const remoteEl = track.attach();
            remoteEl.style.width = '100%';
            remoteEl.style.height = '100%';
            remoteEl.style.objectFit = 'cover';
            remoteVideoRef.current.replaceChildren(remoteEl);
          }
        });
        participant.on('trackUnsubscribed', () => {
          if (remoteVideoRef.current) remoteVideoRef.current.replaceChildren();
        });
      });

      room.on('participantDisconnected', () => {
        if (remoteVideoRef.current) remoteVideoRef.current.replaceChildren();
      });
    } catch (error) {
      console.error('Error joining room:', error.code, error.message);
      leaveVideoRoom();
    }
  };

  const leaveVideoRoom = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (localTracksRef.current) {
      localTracksRef.current.forEach((track) => track.stop());
      localTracksRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.replaceChildren();
    if (remoteVideoRef.current) remoteVideoRef.current.replaceChildren();
    setIsVideoCall(false);
    setPendingVideoToken(null);
  };

  useEffect(() => {
    const handleCallAccepted = ({ roomName }) => {
      console.log('Call accepted:', roomName);
      if (roomName) {
        setIsVideoCall(true);
        requestVideoTokenAndJoin(roomName);
      }
    };
    socket?.on('call_accepted', handleCallAccepted);
    return () => socket?.off('call_accepted', handleCallAccepted);
  }, [socket]);

  return { initiateCall, requestVideoTokenAndJoin, joinVideoRoom, leaveVideoRoom, localVideoRef, remoteVideoRef };
};

export default useVideoCall;