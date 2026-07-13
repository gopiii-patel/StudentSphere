const mongoose = require("mongoose");

const hostelPostSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Room Available",
        "Need Roommate",
        "Good Mess",
        "PG Near College",
      ],
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    contact: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    rent: Number,

    location: String,

    budget: Number,

    hostel: String,

    branch: String,

    year: Number,

    genderPreference: String,

    messPrice: Number,

    vegNonVeg: String,

    distance: String,

    rating: Number,

    facilities: [String],
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.HostelPost ||
  mongoose.model(
    "HostelPost",
    hostelPostSchema
  );