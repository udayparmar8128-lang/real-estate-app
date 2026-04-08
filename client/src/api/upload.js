import api from './axiosInstance';

/**
 * Upload a single image file to Cloudinary via backend.
 * @param {File} file - the browser File object
 * @param {Function} onProgress - optional callback(percent: number)
 * @returns {{ url, public_id }} from the backend response
 */
export const uploadImage = (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  return api.post('/upload', formData, {
    // Do NOT set Content-Type here — the axiosInstance interceptor detects
    // FormData and lets the browser set multipart/form-data with the correct boundary.
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};
