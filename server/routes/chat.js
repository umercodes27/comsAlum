import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getUserChats, getMessagesBetweenUsers } from '../controllers/chat.js';

const router = express.Router();

// 🔐 All routes below require authentication
router.get('/chats', verifyToken, getUserChats); // ?userId=123
router.get('/messages', verifyToken, getMessagesBetweenUsers); // ?sender=123&receiver=456

export default router;
