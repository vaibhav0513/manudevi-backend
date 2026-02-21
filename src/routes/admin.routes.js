const express = require('express');
const router = express.Router();

const {
  updateUserRole,
  toggleUserStatus,
  deleteUserPermanently,
  getDashboardStats,
  searchUsers,
  getAllUsers
} = require('../controllers/admin.controller');

const {
  validate,
  updateRoleSchema,
} = require('../middlewares/validationMiddleware');

const { verifyAppToken } = require("../middlewares/appAuth");
const { verifyToken, authorize } = require('../middlewares/authMiddleware');

// All admin routes require authentication
router.use(verifyToken);

router.get(
  '/users',
  authorize('admin', 'super_admin'),
  verifyAppToken,
  getAllUsers
);


// Dashboard stats (admin & super_admin)
router.get('/stats', authorize('admin', 'super_admin'), getDashboardStats);

// Search users (admin & super_admin)
router.get('/users/search', authorize('admin', 'super_admin'), searchUsers);

// User management (admin & super_admin)
router.put(
  '/users/:id/role',
  authorize('admin', 'super_admin'),
  validate(updateRoleSchema),
  updateUserRole
);

router.put(
  '/users/:id/status',
  authorize('admin', 'super_admin'),
  toggleUserStatus
);

// Permanent deletion (super_admin only)
router.delete(
  '/users/:id',
  authorize('super_admin'),
  deleteUserPermanently
);

module.exports = router;