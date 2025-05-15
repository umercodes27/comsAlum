// 📁 client/src/scenes/chat/ChatPage.jsx (updated to use real users)
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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar with real user list */}
      <div style={{ width: '25%', borderRight: '1px solid #ccc', padding: '1rem' }}>
        {users.map((user) => (
          <div
            key={user._id}
            style={{ cursor: 'pointer', marginBottom: '1rem' }}
            onClick={() => {
              setActiveChat(user);
              fetchMessages(user._id);
            }}
          >
            {user.firstName} {user.lastName}
          </div>
        ))}
      </div>

      {/* Chat Box */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '0.5rem' }}>
              <strong>{msg.sender === _id ? 'Me' : 'Them'}:</strong> {msg.content}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flexGrow: 1, padding: '0.5rem' }}
            placeholder="Type a message..."
          />
          <button onClick={handleSend} style={{ padding: '0.5rem 1rem' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
