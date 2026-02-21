const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    middle_name: {
      type: String,
      trim: true,
      maxlength: [50, "Middle name cannot exceed 50 characters"],
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    mobile_no: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Mobile number must be 10 digits",
      },
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email",
      },
      index: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "user"],
      default: "user",
      index: true,
    },
    terms_accepted: {
      type: Boolean,
      required: [true, "Terms acceptance is required"],
      validate: {
        validator: function (v) {
          return v === true;
        },
        message: "You must accept the terms and conditions",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: true, // Set to true after OTP verification
    },
    lastLogin: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for full name
userSchema.virtual("full_name").get(function () {
  if (this.middle_name) {
    return `${this.first_name} ${this.middle_name} ${this.last_name}`;
  }
  return `${this.first_name} ${this.last_name}`;
});

// Index for text search
userSchema.index({ first_name: "text", last_name: "text", email: "text" });

// Pre-save middleware
userSchema.pre("save", function (next) {
  if (this.isModified("mobile_no")) {
    this.mobile_no = this.mobile_no.replace(/\D/g, "");
  }
  // next();
});

// Methods
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
userSchema.statics.findByMobile = function (mobile_no) {
  return this.findOne({ mobile_no });
};

userSchema.statics.findByFirebaseUid = function (firebaseUid) {
  return this.findOne({ firebaseUid });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
