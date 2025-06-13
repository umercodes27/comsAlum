import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// 1️⃣ Get all messages between two users
export const getMessagesBetweenUsers = async (req, res) => {
  const { sender, receiver } = req.query;

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Missing sender or receiver" });
  }

  try {
    let chat = await Chat.findOne({ participants: { $all: [sender, receiver] } });

    if (!chat) {
      chat = await Chat.create({ participants: [sender, receiver] });
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Error in getMessagesBetweenUsers:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


// 2️⃣ Get the last message between two users
export const getLastMessage = async (req, res) => {
  const { sender, receiver } = req.query;

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Missing sender or receiver ID" });
  }

  try {
    const message = await Message.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(message || {});
  } catch (err) {
    console.error("❌ Error in getLastMessage:", err);
    res.status(500).json({ error: "Failed to fetch last message" });
  }
};

// 3️⃣ Get all user chats (with friend details)
export const getUserChats = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const chats = await Chat.find({ participants: userId });

    // Optionally enrich with user data (the other participant)
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const friendId = chat.participants.find((id) => id !== userId);
        const friend = await User.findById(friendId).select("firstName lastName picturePath");
        return { chatId: chat._id, friend };
      })
    );

    res.status(200).json(enrichedChats);
  } catch (err) {
    console.error("❌ Error in getUserChats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

// export { getMessagesBetweenUsers, getLastMessage, getUserChats };