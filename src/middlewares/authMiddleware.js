// const admin = require('../config/firebase');
// const User = require('../models/User');
// const logger = require('../config/logger');

// /**
//  * Verify Firebase ID Token
//  */
// const verifyToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided. Please provide a valid authorization token.',
//       });
//     }

//     const idToken = authHeader.split('Bearer ')[1];

//     // Verify the Firebase ID token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     // Find user in database
//     const user = await User.findOne({ firebaseUid: decodedToken.uid });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found. Please register first.',
//       });
//     }

//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         message: 'Your account has been deactivated. Please contact support.',
//       });
//     }

//     // Attach user to request
//     req.user = user;
//     req.firebaseUser = decodedToken;

//     next();
//   } catch (error) {
//     logger.error(`Token verification error: ${error.message}`);

//     if (error.code === 'auth/id-token-expired') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token has expired. Please login again.',
//       });
//     }

//     if (error.code === 'auth/argument-error') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token format.',
//       });
//     }

//     return res.status(401).json({
//       success: false,
//       message: 'Invalid or expired token. Please login again.',
//     });
//   }
// };

// /**
//  * Check if user has required role
//  */
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required.',
//       });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: `Access denied. Required role: ${roles.join(' or ')}`,
//       });
//     }

//     next();
//   };
// };

// /**
//  * Optional authentication - doesn't fail if no token
//  */
// const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return next();
//     }

//     const idToken = authHeader.split('Bearer ')[1];
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const user = await User.findOne({ firebaseUid: decodedToken.uid });

//     if (user && user.isActive) {
//       req.user = user;
//       req.firebaseUser = decodedToken;
//     }

//     next();
//   } catch (error) {
//     // Continue without authentication
//     next();
//   }
// };

// module.exports = {
//   verifyToken,
//   authorize,
//   optionalAuth,
// };



const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Verify JWT Token (instead of Firebase)
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        message: 'No token provided. Please provide a valid authorization token.',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database by userId from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found. Please login again.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = decoded.userId;
    req.mobile_no = decoded.mobile_no;

    next();
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: 'Token has expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: false,
        message: 'Invalid token. Please login again.',
      });
    }

    return res.status(401).json({
      status: false,
      message: 'Authentication failed. Please login again.',
    });
  }
};

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  verifyToken,
  authorize,
  optionalAuth,
};