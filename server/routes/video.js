// routes/video.js
import express from 'express';
import { getVideoToken } from '../controllers/video.js';
import { verifyToken } from '../middleware/auth.js'; 

const router = express.Router();

/**
 * @route   POST /video/token
 * @desc    Generate Twilio video access token
 * @access  Protected (requires valid JWT)
 */
router.post('/token', verifyToken, getVideoToken); 

export default router;
