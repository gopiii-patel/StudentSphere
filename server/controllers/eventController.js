const Event = require("../models/Event");
const User = require("../models/user");

// Create Event (Admin)
exports.createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create events.",
      });
    }

    const {
      title,
      description,
      venue,
      date,
      time,
      organizer,
    } = req.body;

    if (
      !title ||
      !description ||
      !venue ||
      !date ||
      !time ||
      !organizer
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const event = await Event.create({
      title,
      description,
      venue,
      date,
      time,
      organizer,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name")
      .sort({ date: 1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Single Event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.registeredStudents.includes(req.user.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Already registered",
      });
    }

    event.registeredStudents.push(req.user.id);

    await event.save();

    res.json({
      success: true,
      message: "Registered Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Event (Admin)
exports.updateEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update events.",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Event (Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete events.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};