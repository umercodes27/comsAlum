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
  const [videoRoom, setVideoRoom] = useState(null);
  const [incomingCallToast, setIncomingCallToast] = useState(null); // Initialize state
  const [pendingVideoToken, setPendingVideoToken] = useState(null); // State to store token
  const [videoKey, setVideoKey] = useState(Date.now()); // Key to force remount for video
  const ringtoneRef = useRef(null);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const _id = user?._id;

  // Join socket room
  useEffect(() => {
    const joinSocketRoom = () => {
      socket.emit('join', { userId: _id });
    };
    if (_id) {
      if (socket.connected) {
        joinSocketRoom();
      } else {
        socket.on('connect', joinSocketRoom);
      }
    }
    return () => {
      socket.off('connect', joinSocketRoom);
    };
  }, [_id]);

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/${_id}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      } catch (err) {
        console.error('❌ Error fetching friends:', err);
      }
    };
    if (_id && token) {
      fetchFriends();
    }
  }, [_id, token]);

  // Fetch last messages for each friend
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
          result.status === 'fulfilled' ? result.value?.data?.content || 'No messages yet.' : 'No messages yet.';
      });
      setLastMessages(previews);
    };
    if (friends.length > 0) fetchLastMessages();
  }, [friends]);

  // Fetch messages for a specific friend
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

  // Handle friend selection
  const handleSelectFriend = (friend) => {
    setActiveChat(friend);
    fetchMessages(friend._id);
  };

  // Handle sending a new message
  const handleSend = () => {
    if (!newMessage || !activeChat) return;
    const messageData = {
      sender: _id,
      receiver: activeChat._id,
      content: newMessage,
    };
    socket.emit('send_message', messageData);
    setMessages([...messages, { ...messageData, createdAt: new Date() }]);
    setNewMessage('');
    setLastMessages((prev) => ({
      ...prev,
      [activeChat._id]: messageData.content,
    }));
  };

  // Listen for incoming messages
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
  }, [activeChat]);

  // Handle video calls
  const video = useVideoCall({
    activeChat,
    token,
    socket,
    onRoomJoined: setVideoRoom,
    onCallRejected: () => setIncomingCallToast(null),
    setIsVideoCall,
    setPendingVideoToken, // Passing setPendingVideoToken correctly here
    setVideoRoom,
  });

  useEffect(() => {
    const handleIncomingCall = ({ from, roomName }) => {
      const caller = friends.find(f => f._id === from);

      ringtoneRef.current = new Audio('http://localhost:3001/assets/ringtone.mp3');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(err => console.error('Audio play error:', err));

      setIncomingCallToast({
        from,
        roomName,
        fromName: caller ? `${caller.firstName} ${caller.lastName}` : 'Unknown Caller',
        onAccept: () => {
          socket.emit('accept_call', { from: _id, to: from, roomName });
          setIncomingCallToast(null);
          ringtoneRef.current?.pause();
          ringtoneRef.current = null;
          video.requestVideoTokenAndJoin(roomName);
        },
        onReject: () => {
          socket.emit('reject_call', { from: _id, to: from });
          setIncomingCallToast(null);
          ringtoneRef.current?.pause();
          ringtoneRef.current = null;
        },
      });
    };

    socket.on('call_user', handleIncomingCall);
    return () => socket.off('call_user', handleIncomingCall);
  }, [friends, _id]);

  // Initiate video call
  const getVideoToken = () => {
    if (!activeChat) return;
    video.initiateCall({ from: _id, to: activeChat._id, roomName: activeChat._id });
  };

  // Use the `pendingVideoToken` state to defer the video connection until ready
  useEffect(() => {
    if (isVideoCall && pendingVideoToken) {
      setTimeout(() => {
        setVideoKey(Date.now()); // Force remount for first-time video call
        video.joinVideoRoom(pendingVideoToken);
        setPendingVideoToken(null); // Clear the token after use
      }, 100); // Delay to ensure DOM is ready
    }
  }, [isVideoCall, pendingVideoToken]);

  return (
    <ChatPageUI
      key={videoKey} // This will force remount on each new video call
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
      onAcceptCall={incomingCallToast?.onAccept}
      onRejectCall={incomingCallToast?.onReject}
    />
  );
};

export default ChatPage;
