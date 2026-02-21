const mongoose = require('mongoose');


const singleServiceSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "" },
  type: { type: String, required: true },
  route: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { _id: false });


const featureSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['aartis', 'songs', 'history', 'stotras', 'other'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

// const serviceSchema = new mongoose.Schema({
//   id: {
//     type: Number,
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   type: {
//     type: String,
//     required: true,
//     enum: ['pooja', 'epass', 'seva', 'mandap', 'donation', 'other'],
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// }, { _id: false });

const serviceCategorySchema = new mongoose.Schema({
  category_id: { type: Number, required: true },
  category_name: { type: String, required: true },
  services: { type: [singleServiceSchema], default: [] },
}, { _id: false });


const liveDarshanSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    default: 1,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  watching_count: {
    type: Number,
    default: 0,
  },
  stream_url: {
    type: String,
    required: true,
  },
  isLive: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const dailyPanchangSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  tithi: {
    type: String,
    required: true,
  },
  nakshatra: {
    type: String,
    required: true,
  },
  yoga: {
    type: String,
    required: true,
  },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const templeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  location_url: {
    type: String,
    required: true,
  },
  banner_images: [{
    type: String,
    required: true,
  }],
  title_text: {
    type: String,
    required: true,
  },
  notification_count: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const homeDataSchema = new mongoose.Schema(
  {
    temple: {
      type: templeSchema,
      required: true,
    },
    features: {
      type: [featureSchema],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one feature is required',
      },
    },
    services: {
  type: [serviceCategorySchema],
  required: true,
  validate: {
    validator: function(v) { return v && v.length > 0; },
    message: 'At least one service category is required',
  },
},

    live_darshan: {
      type: liveDarshanSchema,
      required: false,
    },
    daily_panchang: {
      type: dailyPanchangSchema,
      required: false,
    },
    events: {
      type: [eventSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get active home data
homeDataSchema.statics.getActiveHomeData = function() {
  return this.findOne({ isActive: true }).lean();
};

const HomeData = mongoose.model('HomeData', homeDataSchema);

module.exports = HomeData;