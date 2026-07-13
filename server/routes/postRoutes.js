const express = require("express");
const {
  createPost,
  getPosts,
  toggleLikePost,
  commentPost,
  updatePost,
  deletePost,
  getUserPosts,
  toggleSavePost,
  getSavedPosts,

} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware to all post routes
router.use(authMiddleware);

router.route("/")
  .post(createPost)
  .get(getPosts);

router.get("/user/:userId", getUserPosts);

router.route("/:id")
  .put(updatePost)
  .delete(deletePost);

router.put("/like/:id", toggleLikePost);
router.put("/comment/:id", commentPost);

router.put(
  "/save/:id",
  toggleSavePost
);

router.get(
  "/saved/all",
  getSavedPosts
);

module.exports = router;