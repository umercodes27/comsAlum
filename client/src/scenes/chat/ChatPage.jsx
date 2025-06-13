import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';

const socket = io(import.meta.env.VITE_SERVER_URL);

const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const _id = user?._id;

  // Join socket room
  useEffect(() => {
    const joinSocketRoom = () => {
      console.log("Joining socket room for:", _id);
      socket.emit("join", { userId: _id });
    };

    if (_id) {
      if (socket.connected) {
        joinSocketRoom();
      } else {
        socket.on("connect", joinSocketRoom);
      }
    }

    return () => {
      socket.off("connect", joinSocketRoom);
    };
  }, [_id]);

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        console.log("Fetching friends for:", _id);
        console.log("🪪 Sending token:", token);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/users/${_id}/friends`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ Fetched friends:", res.data);
        setFriends(res.data);
      } catch (err) {
        console.error("❌ Error fetching friends:", err.response?.data || err.message);
      }
    };


    if (_id && token){
      console.log("ChatPage token:", token);
      console.log("ChatPage _id:", _id);
      fetchFriends();
    }
    else {
      console.warn("🚫 Skipping fetchFriends — missing token or _id:", { _id, token });
    }

  }, [_id, token]);

  // Fetch last messages
  useEffect(() => {
    const fetchLastMessages = async () => {
      try {
        const promises = friends.map((friend) =>
          axios.get(`${import.meta.env.VITE_SERVER_URL}/chat/last-message`, {
            params: { sender: _id, receiver: friend._id },
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        const results = await Promise.allSettled(promises);
        const previews = {};
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            previews[friends[i]._id] = result.value?.data?.content || "No messages yet.";
          } else {
            // Optional: log errors or fallback
            console.warn(`No message found for ${friends[i]._id}`);
            previews[friends[i]._id] = "No messages yet.";
          }
        });
        setLastMessages(previews);
        console.log("Last messages fetched:", previews);
      } catch (err) {
        console.error("Error fetching last messages:", err);
      }
    };

    if (friends.length > 0) fetchLastMessages();
  }, [friends]);


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
    setLastMessages((prev) => ({
      ...prev,
      [activeChat._id]: newMessage,
    }));
  };

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (msg.sender === activeChat?._id || msg.receiver === activeChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
      setLastMessages((prev) => ({
        ...prev,
        [msg.sender === _id ? msg.receiver : msg.sender]: msg.content,
      }));
    });

    return () => socket.off("receive_message");
  }, [activeChat]);

  const filteredFriends = friends.filter((f) =>
    `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', fontSize: '0.85rem' }}>
      {/* Friend Sidebar */}
      <div style={{ width: '35%', borderRight: '1px solid #ccc', padding: '0.5rem', overflowY: 'auto' }}>
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.4rem',
            marginBottom: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            outline: 'none',
          }}
        />

        {console.log("All friends:", friends)}
        {console.log("Search value:", search)}


        {(() => {
          const matchedFriends = friends.filter((f) =>
            `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase())
          );
          const unmatchedFriends = friends.filter(
            (f) => !matchedFriends.includes(f)
          );
          const allSortedFriends = [...matchedFriends, ...unmatchedFriends];

          return allSortedFriends.length === 0 ? (
            <div style={{ color: '#888', paddingTop: '1rem' }}>
              No friends found.
            </div>
          ) : (
            allSortedFriends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => {
                  setActiveChat(friend);
                  fetchMessages(friend._id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  padding: '0.4rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeChat?._id === friend._id ? '#f0f0f0' : 'transparent',
                }}
              >
                <img
                  src={`${import.meta.env.VITE_SERVER_URL}/assets/${friend.picturePath || 'default-profile.jpg'}`}
                  alt="profile"
                  onError={(e) => (e.target.src = `${import.meta.env.VITE_SERVER_URL}/assets/default-profile.jpg`)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    marginRight: '0.6rem',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {friend.firstName} {friend.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {lastMessages[friend._id] || "No messages yet."}
                  </div>
                </div>
              </div>
            ))
          );
        })()}
      </div>

      {/* Chat Window */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '0.5rem' }}>
          {activeChat ? (
            messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '0.3rem' }}>
                <strong>{msg.sender === _id ? 'Me' : activeChat.firstName}:</strong> {msg.content}
              </div>
            ))
          ) : (
            <div style={{ color: '#999', textAlign: 'center', marginTop: '2rem' }}>
              Select a friend to start chatting.
            </div>
          )}
        </div>

        {/* Input Box */}
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flexGrow: 1,
              padding: '0.4rem',
              border: '1px solid #ccc',
              borderRadius: '4px 0 0 4px',
              outline: 'none',
            }}
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
