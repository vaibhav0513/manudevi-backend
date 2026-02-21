const express = require('express');
const router = express.Router();

const {
  getHomeData,
  createOrUpdateHomeData,
  updateTempleInfo,
  updateNotificationCount,
  updateLiveDarshan,
  updatePanchang,
  addEvent,
  updateWatchingCount,
  getServices ,
} = require('../controllers/home.controller');

const { verifyToken, authorize } = require('../middlewares/authMiddleware');

// Public routes - No authentication required
router.get('/home', getHomeData);
router.put('/watching-count', updateWatchingCount);

// Admin routes (require authentication and admin/super_admin role)
router.post(
  '/',
  verifyToken,
  authorize('admin', 'super_admin'),
  createOrUpdateHomeData
);

router.put(
  '/temple',
  verifyToken,
  authorize('admin', 'super_admin'),
  updateTempleInfo
);

router.put(
  '/notifications',
  verifyToken,
  authorize('admin', 'super_admin'),
  updateNotificationCount
);

router.put(
  '/live-darshan',
  verifyToken,
  authorize('admin', 'super_admin'),
  updateLiveDarshan
);

router.put(
  '/panchang',
  verifyToken,
  authorize('admin', 'super_admin'),
  updatePanchang
);

router.post(
  '/events',
  verifyToken,
  authorize('admin', 'super_admin'),
  addEvent
);


// GET /api/v1/services
router.get("/services", getServices);
module.exports = router;