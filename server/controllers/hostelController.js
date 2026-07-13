const HostelPost = require("../models/HostelPost");
const cloudinary = require("../config/cloudinary");

// CREATE
const createPost = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "StudentSphere/HostelHub",
      });

      imageUrl = uploaded.secure_url;
    }

    let facilities = [];

    if (req.body.facilities) {
      try {
        facilities = JSON.parse(req.body.facilities);
      } catch {
        facilities = req.body.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const post = await HostelPost.create({
      owner: req.user.id,

      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      contact: req.body.contact,

      image: imageUrl,

      rent: req.body.rent,
      location: req.body.location,

      budget: req.body.budget,
      hostel: req.body.hostel,
      branch: req.body.branch,
      year: req.body.year,
      genderPreference: req.body.genderPreference,

      messPrice: req.body.messPrice,
      vegNonVeg: req.body.vegNonVeg,
      distance: req.body.distance,
      rating: req.body.rating,

      facilities,
    });

    const populated = await HostelPost.findById(post._id).populate(
      "owner",
      "name profilePicture branch"
    );

    res.status(201).json(populated);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET
const getPosts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const posts = await HostelPost.find(filter)
      .populate("owner", "name profilePicture branch")
      .sort({
        createdAt: -1,
      });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE
const updatePost = async (req, res) => {
  try {
    const post = await HostelPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "StudentSphere/HostelHub",
      });

      post.image = uploaded.secure_url;
    }

    post.category = req.body.category || post.category;
    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.contact = req.body.contact || post.contact;

    post.rent = req.body.rent || post.rent;
    post.location = req.body.location || post.location;
    post.budget = req.body.budget || post.budget;
    post.hostel = req.body.hostel || post.hostel;
    post.branch = req.body.branch || post.branch;
    post.year = req.body.year || post.year;
    post.genderPreference =
      req.body.genderPreference || post.genderPreference;

    post.messPrice = req.body.messPrice || post.messPrice;
    post.vegNonVeg = req.body.vegNonVeg || post.vegNonVeg;
    post.distance = req.body.distance || post.distance;
    post.rating = req.body.rating || post.rating;

    if (req.body.facilities) {
      try {
        post.facilities = JSON.parse(req.body.facilities);
      } catch {
        post.facilities = [];
      }
    }

    await post.save();

    const updated = await HostelPost.findById(post._id).populate(
      "owner",
      "name profilePicture branch"
    );

    res.json(updated);

  } catch (error) {
    console.log("==================");
    console.log(error);
    console.log("==================");

    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
const deletePost = async (req, res) => {
  try {
    const post = await HostelPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await post.deleteOne();

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  updatePost,
  deletePost,
};