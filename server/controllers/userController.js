import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Property from '../models/Property.js';

// @desc   Get profile of logged-in user
// @route  GET /api/users/me
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc   Update profile
// @route  PUT /api/users/me
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});

// @desc   Get properties listed by logged-in user
// @route  GET /api/users/me/properties
// @access Private
export const getUserProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: properties.length, data: properties });
});

// @desc   Toggle property in wishlist
// @route  POST /api/users/me/wishlist
// @access Private
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.body;
  const user = await User.findById(req.user._id);

  const alreadySaved = user.wishlist.includes(propertyId);
  if (alreadySaved) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
  } else {
    user.wishlist.push(propertyId);
  }

  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// @desc   Get user's wishlist
// @route  GET /api/users/me/wishlist
// @access Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({ success: true, data: user.wishlist });
});
