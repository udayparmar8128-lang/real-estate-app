import asyncHandler from 'express-async-handler';
import Property from '../models/Property.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc   Get all properties (with filters & pagination)
// @route  GET /api/properties?city=&type=&listingType=&minPrice=&maxPrice=&search=&page=&limit=
// @access Public
export const getProperties = asyncHandler(async (req, res) => {
  const { city, type, listingType, minPrice, maxPrice, search, page = 1, limit = 50 } = req.query;

  const query = { status: 'active' };

  if (type)        query.type        = type;
  if (listingType) query.listingType = listingType;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Build search conditions as an array so we can combine them cleanly
  const searchConditions = [];

  if (city) {
    searchConditions.push({ 'location.city': { $regex: city.trim(), $options: 'i' } });
  }

  if (search) {
    const s = search.trim();
    searchConditions.push({
      $or: [
        { title:              { $regex: s, $options: 'i' } },
        { description:        { $regex: s, $options: 'i' } },
        { 'location.city':   { $regex: s, $options: 'i' } },
        { 'location.address':{ $regex: s, $options: 'i' } },
        { 'location.state':  { $regex: s, $options: 'i' } },
      ],
    });
  }

  // Combine: all conditions must be satisfied (city AND search)
  if (searchConditions.length === 1) {
    Object.assign(query, searchConditions[0]);
  } else if (searchConditions.length > 1) {
    query.$and = searchConditions;
  }

  const skip     = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate('owner', 'name email avatar phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Property.countDocuments(query),
  ]);

  res.json({ success: true, count: total, data: properties, page: Number(page) });
});


// @desc   Get single property by ID
// @route  GET /api/properties/:id
// @access Public
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    'owner',
    'name email avatar phone'
  );

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Increment view count
  property.views += 1;
  await property.save();

  res.json({ success: true, data: property });
});

// @desc   Create new property
// @route  POST /api/properties   (multipart/form-data)
// @access Private
export const createProperty = asyncHandler(async (req, res) => {
  // ── Upload each file buffer to Cloudinary ─────────────────────────
  let images = [];
  if (Array.isArray(req.files) && req.files.length > 0) {
    try {
      const uploads = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer))
      );
      images = uploads.map((result) => ({
        url:       result.secure_url,
        public_id: result.public_id,
      }));
    } catch (cloudErr) {
      res.status(500);
      throw new Error(`Image upload failed: ${cloudErr.message}`);
    }
  }

  // ── Assemble location from flat FormData fields ──────────────────
  const location = {
    address: (req.body.address || '').trim(),
    city:    (req.body.city    || '').trim(),
    state:   (req.body.state   || '').trim(),
    pincode: (req.body.pincode || '').trim(),
  };

  const doc = {
    title:       (req.body.title       || '').trim(),
    description: (req.body.description || '').trim(),
    type:        req.body.type        || 'Apartment',
    listingType: req.body.listingType || 'sale',
    price:       Number(req.body.price)     || 0,
    area:        Number(req.body.area)      || 0,
    bedrooms:    Number(req.body.bedrooms)  || 0,
    bathrooms:   Number(req.body.bathrooms) || 0,
    furnished:   req.body.furnished || 'Unfurnished',
    images,
    location,
    owner: req.user._id,
  };

  try {
    const property = await Property.create(doc);
    res.status(201).json({ success: true, data: property });
  } catch (validationErr) {
    const messages = validationErr.errors
      ? Object.values(validationErr.errors).map((e) => e.message).join(', ')
      : validationErr.message;
    res.status(400);
    throw new Error(messages);
  }
});

// @desc   Update property
// @route  PUT /api/properties/:id   (multipart/form-data)
// @access Private (owner only)
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  if (property.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  // ── Images: upload new files if provided, else keep existing ─────────
  let images = property.images; // default: keep existing images
  if (Array.isArray(req.files) && req.files.length > 0) {
    try {
      const uploads = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer))
      );
      images = uploads.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
    } catch (cloudErr) {
      console.error('[updateProperty] Cloudinary error:', cloudErr);
      res.status(500);
      throw new Error(`Image upload failed: ${cloudErr.message || JSON.stringify(cloudErr)}`);
    }
  }

  // ── Assemble location (FormData sends flat fields) ────────────────────
  const location = {
    address: (req.body.address ?? property.location?.address ?? '').toString().trim(),
    city:    (req.body.city    ?? property.location?.city    ?? '').toString().trim(),
    state:   (req.body.state   ?? property.location?.state   ?? '').toString().trim(),
    pincode: (req.body.pincode ?? property.location?.pincode ?? '').toString().trim(),
  };

  // ── Build update payload ───────────────────────────────────────────────
  const updates = {
    title:       (req.body.title       ?? property.title).toString().trim(),
    description: (req.body.description ?? property.description).toString().trim(),
    type:        req.body.type        || property.type,
    listingType: req.body.listingType || property.listingType,
    price:       req.body.price    ? Number(req.body.price)     : property.price,
    area:        req.body.area     ? Number(req.body.area)      : property.area,
    bedrooms:    req.body.bedrooms ? Number(req.body.bedrooms)  : property.bedrooms,
    bathrooms:   req.body.bathrooms? Number(req.body.bathrooms) : property.bathrooms,
    furnished:   req.body.furnished || property.furnished,
    images,
    location,
  };

  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: updated });
});


// @desc   Delete property
// @route  DELETE /api/properties/:id
// @access Private (owner or admin)
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const isOwner = property.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this property');
  }

  await property.deleteOne();
  res.json({ success: true, message: 'Property removed successfully' });
});
