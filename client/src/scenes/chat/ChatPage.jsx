import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';

const socket = io(import.meta.env.VITE_SERVER_URL);

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const { _id, token } = useSelector((state) => state.user);

  useEffect(() => {
    socket.emit("join", { userId: _id });
  }, [_id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [_id, token]);

  const fetchMessages = async (receiverId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/chat/messages`,
        {
          params: { sender: _id, receiver: receiverId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = () => {
    if (!newMessage || !activeChat) return;
    const messageData = {
      sender: _id,
      receiver: activeChat._id,
      content: newMessage,
    };
    socket.emit("send_message", messageData);
    setMessages([...messages, { ...messageData, createdAt: new Date() }]);
    setNewMessage("");
  };

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (msg.sender === activeChat?._id || msg.receiver === activeChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("receive_message");
  }, [activeChat]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        fontFamily: 'Arial, sans-serif',
        fontSize: '0.85rem',
      }}
    >
      {/* User List Sidebar */}
      <div
        style={{
          width: '35%',
          borderRight: '1px solid #ccc',
          padding: '0.5rem',
          overflowY: 'auto',
        }}
      >
        {users.map((user) => (
          <div
            key={user._id}
            style={{
              cursor: 'pointer',
              marginBottom: '0.4rem',
              padding: '0.3rem',
              backgroundColor: activeChat?._id === user._id ? '#f0f0f0' : 'transparent',
              borderRadius: '4px',
            }}
            onClick={() => {
              setActiveChat(user);
              fetchMessages(user._id);
            }}
          >
            {user.firstName} {user.lastName}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0.5rem',
        }}
      >
        {/* Message Area */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            marginBottom: '0.5rem',
            paddingRight: '0.2rem',
          }}
        >
          {activeChat ? (
            messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '0.3rem' }}>
                <strong>{msg.sender === _id ? 'Me' : activeChat.firstName}:</strong>{' '}
                {msg.content}
              </div>
            ))
          ) : (
            <div style={{ color: '#999' }}>Select a user to start chatting</div>
          )}
        </div>

        {/* Input Box */}
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{
              flexGrow: 1,
              padding: '0.4rem',
              border: '1px solid #ccc',
              borderRadius: '4px 0 0 4px',
              outline: 'none',
            }}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            style={{
              padding: '0.4rem 0.8rem',
              border: '1px solid #ccc',
              borderLeft: 'none',
              borderRadius: '0 4px 4px 0',
              backgroundColor: '#1976d2',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
