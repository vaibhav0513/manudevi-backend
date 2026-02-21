const User = require('../models/User');
const logger = require('../config/logger');
const { asyncHandler } = require('../middlewares/errorMiddleware');

/**
 * @desc    Get user profile by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Users can only view their own profile unless they're admin
  if (
    req.user._id.toString() !== user._id.toString() &&
    req.user.role !== 'admin' &&
    req.user.role !== 'super_admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this profile');
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject(),
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Users can only update their own profile unless they're admin
  if (
    req.user._id.toString() !== user._id.toString() &&
    req.user.role !== 'admin' &&
    req.user.role !== 'super_admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }

  const { first_name, middle_name, last_name, email, address, profileImage } = req.body;

  // Update allowed fields
  if (first_name) user.first_name = first_name;
  if (middle_name !== undefined) user.middle_name = middle_name;
  if (last_name) user.last_name = last_name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (profileImage) user.profileImage = profileImage;

  await user.save();

  logger.info(`User profile updated: ${user._id}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/:id
 * @access  Private
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Users can only delete their own account unless they're admin
  if (
    req.user._id.toString() !== user._id.toString() &&
    req.user.role !== 'admin' &&
    req.user.role !== 'super_admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this account');
  }

  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();

  logger.info(`User account deactivated: ${user._id}`);

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully',
  });
});

/**
 * @desc    Get all users (with pagination and filters)
 * @route   GET /api/v1/users
 * @access  Private (Admin/Super Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const filter = {};
  
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Get users with pagination
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
};