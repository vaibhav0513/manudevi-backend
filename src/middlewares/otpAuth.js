const jwt = require('jsonwebtoken');

const verifyOtpToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("OTP token verification failed:", err.message);
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

module.exports = { verifyOtpToken };
