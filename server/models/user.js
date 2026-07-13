const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    college: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // User Role
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // Verification
    emailVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: "",
    },

    otpExpires: {
      type: Date,
    },

    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpires: {
      type: Date,
    },

    resetPasswordOtp: {
      type: String,
      default: "",
    },

    resetPasswordOtpExpires: {
      type: Date,
      default: null,
    },

    // Academic Information
    branch: {
      type: String,
      default: "",
    },

    semester: {
      type: Number,
      default: null,
    },

    year: {
      type: Number,
      default: null,
    },

    // Profile
    skills: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    savedPosts: [
      { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);