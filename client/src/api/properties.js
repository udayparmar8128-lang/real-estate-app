import api from './axiosInstance';

/** Get all properties (optional query params: city, type, listingType, etc.) */
export const getProperties = (params = {}) => api.get('/properties', { params });

/** Get a single property by ID */
export const getPropertyById = (id) => api.get(`/properties/${id}`);

/**
 * Create a new property (requires auth).
 * @param {Object} data - property fields including location object
 */
export const createProperty = (data) => api.post('/properties', data);

/**
 * Update a property (requires auth + ownership).
 */
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);

/**
 * Delete a property (requires auth + ownership).
 */
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
