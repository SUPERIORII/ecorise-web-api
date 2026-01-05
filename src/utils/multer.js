import multer from "multer";
import path from "path";
import fs from "fs";

// DEFINE STORAGE LOCATION AND FILENAME FORMAT
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pathDirectory = "./images/upload";

    if (!fs.existsSync(pathDirectory)) {
      fs.mkdirSync(pathDirectory, { recursive: true });
    } else {
      cb(null, pathDirectory);
    }
  },

  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// FILE FILTER
const fileFilter = (req, file, cb) => {
  const allowedType = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedType.includes(file.mimetype)) return cb(null, true);

  return cb(new Error("Only JPEG, JPG and PNG files are allowed!"));
};

// INITIALIZE MULTER ONCE
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
