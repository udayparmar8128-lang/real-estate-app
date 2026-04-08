import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload }  from '../config/cloudinary.js';

const router = express.Router();

// Wraps multer so its errors flow into Express's error handler properly.
// Without this, multer errors are uncaught and the 200-status bug kicks in.
const runUpload = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(`Image upload failed: ${err.message}`));
    }
    next();
  });
};

router
  .route('/')
  .get(getProperties)
  .post(protect, runUpload, createProperty);

router
  .route('/:id')
  .get(getPropertyById)
  .put(protect, runUpload, updateProperty)
  .delete(protect, deleteProperty);

export default router;
