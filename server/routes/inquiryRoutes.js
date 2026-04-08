import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  getReceivedInquiries,
  markInquiryRead,
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInquiry);
router.get('/sent', protect, getMyInquiries);
router.get('/received', protect, getReceivedInquiries);
router.put('/:id/read', protect, markInquiryRead);

export default router;
