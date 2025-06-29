import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import ChatPageUI from './ChatPageUI';
import useVideoCall from './VideoCall';

const socket = io(import.meta.env.VITE_SERVER_URL);

const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [pendingVideoToken, setPendingVideoToken] = useState(null);
  const [incomingCallToast, setIncomingCallToast] = useState(null);
  const ringtoneRef = useRef(null);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const _id = user?._id;

  useEffect(() => {
    const joinSocketRoom = () => socket.emit('join', { userId: _id });
    if (_id) {
      if (socket.connected) joinSocketRoom();
      else socket.on('connect', joinSocketRoom);
    }
    return () => socket.off('connect', joinSocketRoom);
  }, [_id]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/${_id}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      } catch (err) {
        console.error('Error fetching friends:', err);
      }
    };
    if (_id && token) fetchFriends();
  }, [_id, token]);

  useEffect(() => {
    const fetchLastMessages = async () => {
      const promises = friends.map((friend) =>
        axios.get(`${import.meta.env.VITE_SERVER_URL}/chat/last-message`, {
          params: { sender: _id, receiver: friend._id },
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      const results = await Promise.allSettled(promises);
      const previews = {};
      results.forEach((result, i) => {
        previews[friends[i]._id] =
          result.status === 'fulfilled' ? result.value?.data?.content || '-' : '-- Error --';
      });
      setLastMessages(previews);
    };
    if (friends.length > 0) fetchLastMessages();
  }, [friends, _id, token]);

  const fetchMessages = async (receiverId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/chat/messages`, {
        params: { sender: _id, receiver: receiverId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSelectFriend = (friend) => {
    setActiveChat(friend);
    fetchMessages(friend._id);
  };

  const handleSend = () => {
    if (!newMessage || !activeChat) return;
    const messageData = { sender: _id, receiver: activeChat._id, content: newMessage };
    socket.emit('send_message', messageData);
    setMessages([...messages, { ...messageData, createdAt: new Date() }]);
    setNewMessage('');
    setLastMessages((prev) => ({ ...prev, [activeChat._id]: messageData.content }));
  };

  useEffect(() => {
    const receiveMessage = (msg) => {
      if (msg.sender === activeChat?._id || msg.receiver === activeChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
      setLastMessages((prev) => ({
        ...prev,
        [msg.sender === _id ? msg.receiver : msg.sender]: msg.content,
      }));
    };
    socket.on('receive_message', receiveMessage);
    return () => socket.off('receive_message', receiveMessage);
  }, [activeChat, _id]);

  const video = useVideoCall({ activeChat, token, socket, setIsVideoCall, setPendingVideoToken });

  useEffect(() => {
    const handleIncomingCall = ({ from, roomName }) => {
      console.log('Incoming call:', { from, roomName });
      const caller = friends.find((f) => f._id === from);
      ringtoneRef.current = new Audio('http://localhost:3001/assets/ringtone.mp3');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch((err) => console.error('Ringtone error:', err));
      setIncomingCallToast({
        from,
        roomName,
        fromName: caller ? `${caller.firstName} ${caller.lastName}` : 'Unknown Caller',
        onAccept: () => {
          console.log('Accepting call:', { from, roomName });
          setIsVideoCall(true);
          socket.emit('accept_call', { from: _id, to: from, roomName });
          setIncomingCallToast(null);
          ringtoneRef.current?.pause();
          ringtoneRef.current = null;
          setActiveChat(caller || { _id: from });
          video.requestVideoTokenAndJoin(roomName);
        },
        onReject: () => {
          console.log('Rejecting call:', { from });
          socket.emit('reject_call', { from: _id, to: from });
          setIncomingCallToast(null);
          ringtoneRef.current?.pause();
          ringtoneRef.current = null;
        },
      });
    };
    socket.on('call_user', handleIncomingCall);
    return () => socket.off('call_user', handleIncomingCall);
  }, [friends, _id, video]);

  const getVideoToken = () => {
    if (!activeChat) {
      console.error('No active chat selected');
      return;
    }
    setIsVideoCall(true);
    video.initiateCall({ from: _id, to: activeChat._id, roomName: `room-${activeChat._id}-${Date.now()}` });
  };

  useEffect(() => {
    if (isVideoCall && pendingVideoToken) {
      console.log('Joining video room with token:', pendingVideoToken);
      video.joinVideoRoom(pendingVideoToken, activeChat?._id);
      setPendingVideoToken(null);
    }
  }, [isVideoCall, pendingVideoToken, video, activeChat]);

  useEffect(() => {
    console.log('incomingCallToast:', incomingCallToast);
  }, [incomingCallToast]);

  return (
    <ChatPageUI
      friends={friends}
      search={search}
      setSearch={setSearch}
      activeChat={activeChat}
      setActiveChat={handleSelectFriend}
      messages={messages}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleSend={handleSend}
      isVideoCall={isVideoCall}
      leaveVideoRoom={video.leaveVideoRoom}
      getVideoToken={getVideoToken}
      lastMessages={lastMessages}
      incomingCallToast={incomingCallToast}
      onAcceptCall={incomingCallToast ? incomingCallToast.onAccept : () => {}}
      onRejectCall={incomingCallToast ? incomingCallToast.onReject : () => {}}
      localVideoRef={video.localVideoRef}
      remoteVideoRef={video.remoteVideoRef}
    />
  );
};

export default ChatPage;