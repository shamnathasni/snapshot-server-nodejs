const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    if (!isValid) {
      const uploadError = new Error("Invalid image type");
      return cb(uploadError, null);
    }

    cb(null, "../SnapShot-server/Public/Images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadOptions = multer({ storage: storage });

module.exports = { uploadOptions };
