import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect }           from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc   Upload a single image to Cloudinary
// @route  POST /api/upload
// @access Private
router.post(
  '/',
  protect,
  // multer reads the file into memory (req.file.buffer)
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        res.status(400);
        return next(new Error(err.message || 'File upload error'));
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No image file provided');
    }

    // Manually push the memory buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    res.status(201).json({
      success:   true,
      url:       result.secure_url,
      public_id: result.public_id,
    });
  })
);

export default router;
