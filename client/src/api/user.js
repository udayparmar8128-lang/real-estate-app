import api from './axiosInstance';

export const getMyProfile    = ()       => api.get('/users/me');
export const updateMyProfile = (data)   => api.put('/users/me', data);
export const getMyProperties = ()       => api.get('/users/me/properties');
export const getMyWishlist   = ()       => api.get('/users/me/wishlist');
export const toggleWishlist  = (id)     => api.post('/users/me/wishlist', { propertyId: id });
