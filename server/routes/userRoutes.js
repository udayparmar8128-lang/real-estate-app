import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserProperties,
  toggleWishlist,
  getWishlist,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/me').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/me/properties', protect, getUserProperties);
router.route('/me/wishlist').get(protect, getWishlist).post(protect, toggleWishlist);

export default router;
