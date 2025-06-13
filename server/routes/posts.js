import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getFeedPosts,
  getUserPosts,
  likePost,
  createPost,
  deletePost
} from '../controllers/posts.js';
import { verifyToken } from '../middleware/auth.js';



const router = express.Router();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/assets'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

// CREATE
router.post('/', verifyToken, upload.single('picture'), createPost);

// READ
router.get('/', verifyToken, getFeedPosts);
router.get('/:userId/posts', verifyToken, getUserPosts);

// UPDATE
router.patch('/:id/like', verifyToken, likePost);

// DELETE
router.delete("/:id", verifyToken, deletePost);

export default router;
