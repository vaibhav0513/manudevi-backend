const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  register,
  login,
  getCurrentUser,
  logout,
  promoteUser,
  createAdminUser,
} = require('../controllers/auth.controller');
// import { verifyOtpToken } from '../middlewares/otpAuth';
const { verifyOtpToken } =require('../middlewares/otpAuth');

const { verifyAppToken } = require("../middlewares/appAuth");
const {
  validate,
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
} = require('../middlewares/validationMiddleware');

const { verifyToken, authorize } = require('../middlewares/authMiddleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), sendOtp);
// router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/verify-otp', verifyOtpToken, verifyOtp);
router.post('/register', authLimiter, validate(registerSchema), register);
// router.post('/login', authLimiter, login);

// Protected routes
// router.get('/me', verifyToken, getCurrentUser);
// router.post('/logout', verifyToken, logout);
router.get("/me", verifyAppToken, getCurrentUser);
router.post("/logout", verifyAppToken, logout);


// Admin management (Super Admin only)
router.put(
  '/promote-user',
  verifyToken,
  authorize('super_admin'),
  promoteUser
);

router.post(
  '/create-admin',
  verifyToken,
  authorize('super_admin'),
  createAdminUser
);

module.exports = router;