import dotenv from 'dotenv';
dotenv.config(); // ← MUST run before cloudinaryV2.config() reads process.env

import cloudinary from 'cloudinary';
import multer from 'multer';

const cloudinaryV2 = cloudinary.v2;

// Configure Cloudinary — env vars are now guaranteed to be loaded
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug log — confirms values are present at startup
console.log('[Cloudinary] Config check →', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
  api_key:    process.env.CLOUDINARY_API_KEY    ? 'OK' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING',
});

// ── Multer: memory storage ─────────────────────────────────────────────────
// Files are held in memory as Buffer, then manually pushed to Cloudinary
// in the controller. Avoids all multer-storage-cloudinary v4 / cloudinary@1
// compatibility issues.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPG, PNG, or WebP.`), false);
    }
  },
});

// ── Helper: push a Buffer to Cloudinary, return the result ────────────────
export const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream(
      {
        folder: 'real-estate',
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export { cloudinaryV2 as cloudinary };
