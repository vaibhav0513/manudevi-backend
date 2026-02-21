const HomeData = require('../models/Home');
const logger = require('../config/logger');
const { asyncHandler } = require('../middlewares/errorMiddleware');

/**
 * @desc    Get home page data (public)
 * @route   GET /api/v1/home
 * @access  Public
 */
const getHomeData = asyncHandler(async (req, res) => {
  const homeData = await HomeData.getActiveHomeData();

  if (!homeData) {
    return res.status(404).json({
      status: false,
      message: 'Unable to fetch dashboard data',
    });
  }

  // Format response to match exact specification
  const responseData = {
    temple: homeData.temple,
    features: homeData.features,
    live_darshan: homeData.live_darshan,
    services: homeData.services,
    daily_panchang: homeData.daily_panchang,
    events: homeData.events,
  };

  res.status(200).json({
    status: true,
    message: 'Home data fetched successfully',
    data: responseData,
  });
});

/**
 * @desc    Create/Update home page data
 * @route   POST /api/v1/home
 * @access  Private (Admin/Super Admin)
 */
const createOrUpdateHomeData = asyncHandler(async (req, res) => {
  const {
    temple,
    features,
    services,
    live_darshan,
    daily_panchang,
    events,
  } = req.body;

  // Check if home data already exists
  let homeData = await HomeData.findOne({ isActive: true });

  if (homeData) {
    // Update existing
    homeData.temple = temple;
    homeData.features = features;
    homeData.services = services;
    homeData.live_darshan = live_darshan;
    homeData.daily_panchang = daily_panchang;
    homeData.events = events;

    await homeData.save();

    logger.info(`Home data updated by admin: ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Home data updated successfully',
      data: homeData,
    });
  } else {
    // Create new
    homeData = await HomeData.create({
      temple,
      features,
      services,
      live_darshan,
      daily_panchang,
      events,
    });

    logger.info(`Home data created by admin: ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Home data created successfully',
      data: homeData,
    });
  }
});

/**
 * @desc    Update temple info only
 * @route   PUT /api/v1/home/temple
 * @access  Private (Admin/Super Admin)
 */
const updateTempleInfo = asyncHandler(async (req, res) => {
  const homeData = await HomeData.findOne({ isActive: true });

  if (!homeData) {
    res.status(404);
    throw new Error('Home data not found. Please create it first.');
  }

  homeData.temple = { ...homeData.temple, ...req.body };
  await homeData.save();

  logger.info(`Temple info updated by admin: ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Temple information updated successfully',
    data: homeData.temple,
  });
});

/**
 * @desc    Update notification count
 * @route   PUT /api/v1/home/notifications
 * @access  Private (Admin/Super Admin)
 */
const updateNotificationCount = asyncHandler(async (req, res) => {
  const { count } = req.body;

  const homeData = await HomeData.findOne({ isActive: true });

  if (!homeData) {
    res.status(404);
    throw new Error('Home data not found');
  }

  homeData.temple.notification_count = count;
  await homeData.save();

  res.status(200).json({
    success: true,
    message: 'Notification count updated',
    data: {
      notification_count: homeData.temple.notification_count,
    },
  });
});

/**
 * @desc    Update live darshan info
 * @route   PUT /api/v1/home/live-darshan
 * @access  Private (Admin/Super Admin)
 */
const updateLiveDarshan = asyncHandler(async (req, res) => {
  const homeData = await HomeData.findOne({ isActive: true });

  if (!homeData) {
    res.status(404);
    throw new Error('Home data not found');
  }

  homeData.live_darshan = { ...homeData.live_darshan, ...req.body };
  await homeData.save();

  logger.info(`Live darshan updated by admin: ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Live darshan updated successfully',
    data: homeData.live_darshan,
  });
});

/**
 * @desc    Update daily panchang
 * @route   PUT /api/v1/home/panchang
 * @access  Private (Admin/Super Admin)
 */
const updatePanchang = asyncHandler(async (req, res) => {
  const homeData = await HomeData.findOne({ isActive: true });

  if (!homeData) {
    res.status(404);
    throw new Error('Home data not found');
  }

  homeData.daily_panchang = req.body;
  await homeData.save();

  logger.info(`Panchang updated by admin: ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Daily panchang updated successfully',
    data: homeData.daily_panchang,
  });
});

/**
 * @desc    Add event
 * @route   POST /api/v1/home/events
 * @access  Private (Admin/Super Admin)
 */
const addEvent = asyncHandler(async (req, res) => {
  const homeData = await HomeData.findOne({ isActive: true });

  if (!homeData) {
    res.status(404);
    throw new Error('Home data not found');
  }

  homeData.events.push(req.body);
  await homeData.save();

  logger.info(`Event added by admin: ${req.user._id}`);

  res.status(201).json({
    success: true,
    message: 'Event added successfully',
    data: homeData.events,
  });
});

/**
 * @desc    Update watching count
 * @route   PUT /api/v1/home/watching-count
 * @access  Public
 */
const updateWatchingCount = asyncHandler(async (req, res) => {
  const { count } = req.body;

  const homeData = await HomeData.findOne({ isActive: true });

  if (!homeData || !homeData.live_darshan) {
    res.status(404);
    throw new Error('Live darshan not found');
  }

  homeData.live_darshan.watching_count = count;
  await homeData.save();

  res.status(200).json({
    success: true,
    data: {
      watching_count: homeData.live_darshan.watching_count,
    },
  });
});



// const Home = require("../models/Home");

// Get services API
const getServices = async (req, res) => {
  try {
    const home = await HomeData.findOne({}, { services: 1 });
    if (!home) {
      return res.status(404).json({
        status: false,
        message: "No services found",
      });
    }
    res.status(200).json({
      status: true,
      message: "Services fetched successfully",
      data: home.services,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


module.exports = {
  getHomeData,
  createOrUpdateHomeData,
  updateTempleInfo,
  updateNotificationCount,
  updateLiveDarshan,
  updatePanchang,
  addEvent,
  updateWatchingCount,
  getServices,
};