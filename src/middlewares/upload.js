const multer = require('multer');
const path = require('path');

// Simple disk storage; in production use S3 or other cloud storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

module.exports = upload;
