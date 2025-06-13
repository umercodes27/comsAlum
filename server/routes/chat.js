import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getUserChats,
  getMessagesBetweenUsers,
  getLastMessage,
} from '../controllers/chat.js';

const router = express.Router();

// 🔐 All routes below require authentication
router.get('/chats', verifyToken, getUserChats); // ?userId=123
router.get('/messages', verifyToken, getMessagesBetweenUsers); // ?sender=123&receiver=456
router.get('/last-message', verifyToken, getLastMessage); // NEW: last message preview

export default router;
