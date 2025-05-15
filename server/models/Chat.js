// 📁 models/Chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [String], // store user IDs
      required: true,
      validate: [arrayLimit, 'Chat must have exactly 2 participants']
    }
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 2;
}

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
