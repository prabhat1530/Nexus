const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
  console.warn('⚠️ Cloudinary keys not set. Uploads will fail but server will stay up.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'nexus_social';
    if (file.fieldname === 'image') folder += '/posts';
    else if (file.fieldname === 'avatar') folder += '/avatars';
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }], // Optimize images
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
