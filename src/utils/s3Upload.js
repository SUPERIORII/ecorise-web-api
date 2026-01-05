// Import multer for handling multipart/form-data (file uploads)
import multer from "multer";
// Import multerS3 to use S3 as storage engine for multer
import multerS3 from "multer-s3";
// Import AWS SDK to interact with AWS services
import AWS from "aws-sdk";
// Import dotenv to load environment variables from .env file
import dotenv from "dotenv";

// Load environment variables from .env file into process.env
dotenv.config();

// Create an S3 instance using credentials and region from environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION, // AWS region where your bucket is located
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS secret key
  },
});

// Configure multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3, // The S3 instance to use
    bucket: process.env.AWS_S3_BUCKET, // The name of your S3 bucket
    acl: "public-read", // Access control for uploaded files ('public-read' makes them public)
    metadata: function (req, file, cb) {
      // Set metadata for the uploaded file (optional)
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Generate a unique file name for each upload
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Store files in the 'uploads/' folder in the bucket, with a unique name
      cb(null, "uploads/" + uniqueSuffix + "-" + file.originalname);
    },
  }),
});

// Export the configured upload middleware for use in your routes
export default upload;
