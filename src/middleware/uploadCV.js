const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir =
  path.join(process.cwd(), 'uploads', 'cv');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName +
      path.extname(file.originalname)
    );
  },
});

const uploadCV = multer({
  storage,
});

module.exports = uploadCV;