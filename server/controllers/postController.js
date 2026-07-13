const Post = require("../models/post");

/* ---------------- CREATE POST ---------------- */

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content cannot be empty",
      });
    }

    const post = await Post.create({
      content,
      author: req.user.id,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name branch profilePicture semester year"
    );

    // REALTIME EMIT
    const io = req.app.get("io");

    io.emit("post:new", populatedPost);

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ---------------- GET POSTS ---------------- */
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name branch profilePicture semester year")
      .populate("comments.user", "name branch profilePicture");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- TOGGLE LIKE ---------------- */
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const userId = req.user.id.toString();

    // SAFE LIKES ARRAY
    if (!post.likes) {
      post.likes = [];
    }

    const isLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate(
        "author",
        "name branch profilePicture semester year"
      )
      .populate(
        "comments.user",
        "name branch profilePicture"
      );

    // REAL-TIME EMIT
    const io = req.app.get("io");

    if (io) {
      io.emit("post:updated", updatedPost);

// SEND NOTIFICATION TO POST OWNER
     if (
      post.author.toString() !== userId
    ) {
      io.emit("notification", {
        type: "like",
        message: `${req.user.name} liked your post`,
      });
}
    }

    return res.status(200).json(updatedPost);

  } catch (error) {
    console.error("Toggle Like Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ---------------- COMMENT ---------------- */
const commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text cannot be empty",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = {
      user: req.user.id,
      text,
    };

    post.comments.push(comment);

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name branch profilePicture semester year")
      .populate("comments.user", "name branch profilePicture");

    // REALTIME EMIT
    const io = req.app.get("io");

    io.emit("post:updated", updatedPost);

// NOTIFICATION
if (
  post.author.toString() !== req.user.id
) {
  io.emit("notification", {
    type: "comment",
    message: `${req.user.name} commented on your post`,
  });
}

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ---------------- UPDATE POST ---------------- */
const updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.content = content;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name branch profilePicture semester year")
      .populate("comments.user", "name branch profilePicture");

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- DELETE POST ---------------- */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted", postId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- USER POSTS ---------------- */
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("author", "name branch profilePicture semester year")
      .populate("comments.user", "name branch profilePicture");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require("../models/User");

const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const postId = req.params.id;

    const index = user.savedPosts.indexOf(postId);

    if (index === -1) {
      user.savedPosts.push(postId);
    } else {
      user.savedPosts.splice(index, 1);
    }

    await user.save();

    res.json(user.savedPosts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "savedPosts",
        populate: {
          path: "author",
          select: "name profilePicture",
        },
      });

    res.json(user.savedPosts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLikePost,
  commentPost,
  updatePost,
  deletePost,
  getUserPosts,

  toggleSavePost,
  getSavedPosts,
};