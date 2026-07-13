const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
} = require("../controllers/eventController");

// Public Routes
router.get("/", getEvents);
router.get("/:id", getEventById);

router.post(
  "/register/:id",
  authMiddleware,
  registerForEvent
);
// Admin Routes
router.post("/", authMiddleware, adminMiddleware, createEvent);
router.put("/:id", authMiddleware, adminMiddleware, updateEvent);
router.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;