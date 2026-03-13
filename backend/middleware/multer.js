const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ────────────────────────────────────────────────
// Upload directory - flat folder (recommended)
// ────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// ────────────────────────────────────────────────
// Storage configuration
// ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: opp-TIMESTAMP-RANDOM.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `opp-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// ────────────────────────────────────────────────
// File filter - only images
// ────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only JPEG, JPG, PNG, and WebP images are allowed.');
    error.code = 'LIMIT_FILE_TYPE';
    cb(error, false);
  }
};

// ────────────────────────────────────────────────
// Multer instance
// ────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter,
});

// Optional: export a single-file uploader for opportunities
// (you can also keep using upload.single('image') in routes)
module.exports = upload;