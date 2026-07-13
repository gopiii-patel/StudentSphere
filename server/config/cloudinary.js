const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Buffer (for Notes module etc.)
const uploadToCloudinary = (
  fileBuffer,
  resourceType = "auto"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "StudentSphere",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result.secure_url);
      }
    );

    streamifier
      .createReadStream(fileBuffer)
      .pipe(uploadStream);
  });
};

// Export cloudinary itself
cloudinary.uploadToCloudinary = uploadToCloudinary;

module.exports = cloudinary;