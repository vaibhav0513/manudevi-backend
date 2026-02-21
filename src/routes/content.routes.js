const express = require("express");
const router = express.Router();
const { getContentByType } = require("../controllers/content.controller");

router.get("/content/:type", getContentByType);

module.exports = router;
