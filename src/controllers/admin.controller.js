const User = require('../models/User');
const logger = require('../config/logger');
const { asyncHandler } = require('../middlewares/errorMiddleware');


/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin/Super Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select('-password')   // hide password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        totalUsers: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    }
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private (Admin/Super Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent super_admin role assignment by regular admin
  if (role === 'super_admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Only super admins can assign super admin role');
  }

  // Prevent self-role modification
  if (req.user._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error('You cannot modify your own role');
  }

  user.role = role;
  await user.save();

  logger.info(`User role updated: ${user._id} to ${role} by ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: {
      user: user.toSafeObject(),
    },
  });
});

/**
 * @desc    Activate/Deactivate user account
 * @route   PUT /api/v1/admin/users/:id/status
 * @access  Private (Admin/Super Admin)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deactivating super admin by regular admin
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Only super admins can modify super admin accounts');
  }

  // Prevent self-deactivation
  if (req.user._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  logger.info(
    `User account ${user.isActive ? 'activated' : 'deactivated'}: ${user._id} by ${req.user._id}`
  );

  res.status(200).json({
    success: true,
    message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: user.toSafeObject(),
    },
  });
});

/**
 * @desc    Delete user permanently
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private (Super Admin only)
 */
const deleteUserPermanently = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent self-deletion
  if (req.user._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await user.deleteOne();

  logger.warn(`User permanently deleted: ${req.params.id} by ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'User deleted permanently',
  });
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin/Super Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminCount,
    superAdminCount,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'super_admin' }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('first_name last_name email mobile_no createdAt role')
      .lean(),
  ]);

  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers,
    usersByRole: {
      super_admin: superAdminCount,
      admin: adminCount,
      user: totalUsers - adminCount - superAdminCount,
    },
    recentUsers,
  };

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Search users
 * @route   GET /api/v1/admin/users/search
 * @access  Private (Admin/Super Admin)
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { query, role, isActive, limit = 20 } = req.query;

  const filter = {};

  if (query) {
    filter.$or = [
      { first_name: { $regex: query, $options: 'i' } },
      { last_name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { mobile_no: { $regex: query, $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const users = await User.find(filter)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      users,
      count: users.length,
    },
  });
});

module.exports = {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUserPermanently,
  getDashboardStats,
  searchUsers,
};