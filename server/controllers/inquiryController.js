import asyncHandler from 'express-async-handler';
import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';

// @desc   Send inquiry to property owner
// @route  POST /api/inquiries
// @access Private
export const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, name, email, phone, message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Prevent owners from messaging themselves
  if (property.owner.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot contact yourself about your own property');
  }

  const inquiry = await Inquiry.create({
    property: propertyId,
    sender: req.user._id,
    owner: property.owner,
    name,
    email,
    phone,
    message,
  });

  res.status(201).json({ success: true, data: inquiry });
});

// @desc   Get inquiries sent by current user
// @route  GET /api/inquiries/sent
// @access Private
export const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ sender: req.user._id })
    .populate('property', 'title images location')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: inquiries });
});

// @desc   Get inquiries received by current user (as property owner)
// @route  GET /api/inquiries/received
// @access Private
export const getReceivedInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ owner: req.user._id })
    .populate('property', 'title images location')
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: inquiries });
});

// @desc   Mark inquiry as read
// @route  PUT /api/inquiries/:id/read
// @access Private
export const markInquiryRead = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  if (inquiry.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  inquiry.isRead = true;
  await inquiry.save();

  res.json({ success: true, data: inquiry });
});
