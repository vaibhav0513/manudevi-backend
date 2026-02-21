const admin = require("../config/firebase");
const User = require("../models/User");
const logger = require("../config/logger");
const { asyncHandler } = require("../middlewares/errorMiddleware");
const jwt = require("jsonwebtoken");

/**
 * @desc    Send OTP to mobile number
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { mobile_no, device_info } = req.body;

  if (!/^\d{10}$/.test(mobile_no)) {
    return res.status(400).json({
      status: false,
      message: "Invalid mobile number",
    });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("OTP (for testing):", otp);

  // Generate OTP verification token
  const token = jwt.sign(
    { mobile_no, otp, device_info },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "5m" },
  );

  // ✅ Set token in custom header
  res.setHeader("X-OTP-Token", token);

  // ✅ Return response WITHOUT token in body
  res.status(200).json({
    status: true,
    message: "OTP sent successfully",
  });
});

/**
 * @desc    Verify OTP and get Firebase custom token
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */

const verifyOtp = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: false,
      message: "Token missing",
    });
  }

  const token = authHeader.split(" ")[1];
  const { mobile_no, otp } = req.body;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
    );

    // Validate mobile number
    if (decoded.mobile_no !== mobile_no) {
      return res.status(400).json({
        status: false,
        message: "Mobile number mismatch",
      });
    }

    // Validate OTP
    if (decoded.otp !== otp) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP",
      });
    }

    // Check if user exists in DB
    const user = await User.findOne({ mobile_no });

    // Generate final auth token (long-lived)
    const authToken = jwt.sign(
      { userId: user?._id, mobile_no },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }, // valid for 7 days
    );

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
      is_registered: !!user,
      token: authToken, // ✅ send token to frontend
    });
  } catch (err) {
    console.error("OTP verification error:", err.message);
    return res.status(400).json({
      status: false,
      message: "OTP expired. Please resend OTP",
    });
  }
};

/*
 * @desc    Register new user after OTP verification
 * @route   POST /api/v1/auth/register
 * @access  Public (but requires valid Firebase token)
 */
// const jwt = require("jsonwebtoken");

const register = asyncHandler(async (req, res) => {
  const {
    first_name,
    middle_name,
    last_name,
    mobile_no,
    email,
    address,
    terms_accepted,
  } = req.body;

  // 1️⃣ Read Token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  // 2️⃣ Verify Token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }

  // 3️⃣ Mobile match
  if (decoded.mobile_no !== mobile_no) {
    return res.status(400).json({
      status: false,
      message: "Mobile number mismatch",
    });
  }

  // 4️⃣ Terms validation
  if (!terms_accepted) {
    return res.status(400).json({
      status: false,
      message: "Please accept terms & conditions",
    });
  }

  // 5️⃣ Check existing user
  const existingUser = await User.findOne({
    $or: [{ mobile_no }, { email }],
  });

  if (existingUser) {
    return res.status(409).json({
      status: false,
      message: "User already registered",
    });
  }

  // 6️⃣ Create user
  const user = await User.create({
    first_name,
    middle_name,
    last_name,
    mobile_no,
    email,
    address,
    terms_accepted,
    role: "user",
    isMobileVerified: true,
    lastLogin: new Date(),
  });

  return res.status(200).json({
    status: true,
    message: "Account created successfully",
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is already populated by verifyToken middleware
  const user = req.user;

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    status: true,
    success: true,
    data: {
      user: user.toSafeObject ? user.toSafeObject() : user,
    },
  });
});

/**
 * @desc    Logout user (client-side operation)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Firebase logout is handled on client-side
  // This endpoint is mainly for logging purposes

  logger.info(`User logged out: ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});



/**
 * @desc    Promote user to admin/super_admin
 * @route   PUT /api/v1/auth/promote-user
 * @access  Private (Super Admin only)
 */
const promoteUser = asyncHandler(async (req, res) => {
  const { mobile_no, role } = req.body;

  // Only super_admin can promote
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      status: false,
      message: 'Only super admins can promote users',
    });
  }

  // Validate role
  if (!['admin', 'super_admin'].includes(role)) {
    return res.status(400).json({
      status: false,
      message: 'Invalid role. Must be admin or super_admin',
    });
  }

  const user = await User.findOne({ mobile_no });

  if (!user) {
    return res.status(404).json({
      status: false,
      message: 'User not found',
    });
  }

  user.role = role;
  await user.save();

  return res.status(200).json({
    status: true,
    message: `User promoted to ${role} successfully`,
    data: { user: user.toSafeObject ? user.toSafeObject() : user },
  });
});

/**
 * @desc    Create admin user directly
 * @route   POST /api/v1/auth/create-admin
 * @access  Private (Super Admin only)
 */
const createAdminUser = asyncHandler(async (req, res) => {
  const {
    first_name,
    middle_name,
    last_name,
    mobile_no,
    email,
    address,
    role,
  } = req.body;

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      status: false,
      message: 'Only super admins can create admin users',
    });
  }

  if (!['admin', 'super_admin'].includes(role)) {
    return res.status(400).json({
      status: false,
      message: 'Invalid role',
    });
  }

  const existingUser = await User.findOne({
    $or: [{ mobile_no }, { email }],
  });

  if (existingUser) {
    return res.status(409).json({
      status: false,
      message: 'User already exists',
    });
  }

  const adminUser = await User.create({
    first_name,
    middle_name,
    last_name,
    mobile_no,
    email,
    address,
    role,
    terms_accepted: true,
    isMobileVerified: true,
    isActive: true,
  });

  return res.status(201).json({
    status: true,
    message: `${role} created successfully`,
    data: { user: adminUser.toSafeObject() },
  });
});


module.exports = {
  sendOtp,
  verifyOtp,
  register,
  // login,
  getCurrentUser,
  logout,
  promoteUser,      // ← Add
  createAdminUser,  // ← Add
};
