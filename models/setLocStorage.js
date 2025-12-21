const path = require("path");
const fs = require("fs");
const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './client/public/images');
  },
  filename: (req, file, cb) => {
    console.log(file);
    const ext = path.extname(file.originalname);
    cb(null, 'media-' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

exports.storage = storage;
exports.upload = upload;