const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content_html: {
    type: String,
    required: true
  },
  last_updated: {
    type: String,   // stored as string (YYYY-MM-DD)
    required: true
  }
});

module.exports = mongoose.model("Content", contentSchema);
