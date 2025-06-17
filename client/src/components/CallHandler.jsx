import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { connect } from 'twilio-video';

const CallHandler = ({ socket, activeChat, joinVideoRoom }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const _id = user?._id;

  useEffect(() => {
    if (!socket || !_id) return;

    socket.emit('join', { userId: _id });

    socket.on('call_user', ({ from, roomName }) => {
      setIncomingCall({ from, roomName });
    });

    socket.on('call_accepted', ({ roomName }) => {
      console.log('✅ Call accepted. Joining Twilio room:', roomName);
      setIsCalling(false);
      getVideoToken(roomName); // Caller joins Twilio room here
    });

    socket.on('call_rejected', () => {
      setIsCalling(false);
      alert('Call was rejected');
    });

    return () => {
      socket.off('call_user');
      socket.off('call_accepted');
      socket.off('call_rejected');
    };
  }, [socket, _id]);

  const startCall = () => {
    if (!activeChat) return;
    setIsCalling(true);
    socket.emit('call_user', {
      from: _id,
      to: activeChat._id,
      roomName: activeChat._id,
    });
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit('accept_call', {
      from: _id,
      to: incomingCall.from,
      roomName: incomingCall.roomName,
    });
    getVideoToken(incomingCall.roomName); // Callee joins room immediately
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit('reject_call', {
      from: _id,
      to: incomingCall.from,
    });
    setIncomingCall(null);
  };

  const getVideoToken = async (roomName) => {
    if (!roomName) return console.warn('Missing roomName for video token');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/video/token`,
        { roomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const videoToken = response.data.token;
      joinVideoRoom(videoToken); // Calls ChatPage's join logic
    } catch (err) {
      console.error('Error fetching video token:', err);
    }
  };

  return (
    <>
      {incomingCall && (
        <div className="incoming-call">
          <p>📞 Incoming call from {incomingCall.from}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      {!incomingCall && activeChat && !isCalling && (
        <button onClick={startCall}>Start Video Call</button>
      )}

      {isCalling && (
        <div className="calling-status">
          <p>📡 Calling {activeChat?.firstName} {activeChat?.lastName}...</p>
        </div>
      )}
    </>
  );
};

export default CallHandler;
