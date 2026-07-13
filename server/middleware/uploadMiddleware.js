const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Incoming File:", file);

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("Rejected:", file.mimetype);

    cb(
      new Error(
        `Invalid file type: ${file.mimetype}`
      ),
      false
    );
  }
};

module.exports = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      20 * 1024 * 1024,
  },
});