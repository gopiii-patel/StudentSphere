const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} = require("../controllers/hostelController");

router.get("/", getPosts);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updatePost
);

router.delete(
  "/:id",
  authMiddleware,
  deletePost
);

module.exports = router;