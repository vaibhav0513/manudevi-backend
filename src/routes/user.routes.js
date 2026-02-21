const express = require('express');
const router = express.Router();

const {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
} = require('../controllers/user.controller');

const {
  validate,
  updateUserSchema,
} = require('../middlewares/validationMiddleware');

const { verifyToken, authorize } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get all users (admin only)
router.get('/', authorize('admin', 'super_admin'), getAllUsers);

// User profile routes
router.get('/:id', getUserById);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;