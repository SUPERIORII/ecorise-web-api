import multer from "multer";
import upload from "../utils/multer.js";


// ✅ REUSABLE MIDDLEWARE FUNCTION
const uploadSingle = (fieldName) => {
  const singleUpload = upload.single(fieldName);

  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Max (5MB)" });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ error: "Invalid file type" });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      next();
    });
  };
};

export default uploadSingle;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const pathDirectory = "../client/public/upload";

//     if (!fs.existsSync(pathDirectory)) {
//       fs.mkdirSync(pathDirectory, { recursive: true });
//     } else {
//       cb(null, pathDirectory);
//     }
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   // limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const fileType = /jpg|jpeg|png|svg/;

//     const mimetype = fileType.test(file.mimetype);
//     const extname = fileType.test(path.extname(file.originalname));

//     // checking if the file is an image and has the filetype extension
//     if (mimetype && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error("File type is not supported"));
//     }
//   },
// });

// export default upload;
