import express from 'express';
import { 
  getUser, 
  getUserFriends,
  addRemoveFriend,
  getAllUsers
} from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Read
router.get('/:id', verifyToken, getUser);
router.get('/:id/friends', verifyToken, getUserFriends);
router.get('/all', verifyToken, getAllUsers);

// Update
router.patch('/:id/friendID', verifyToken, addRemoveFriend);

export default router;
