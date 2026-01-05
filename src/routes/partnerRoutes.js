import express from "express";
import {
  getPartners,
  registerPartners,
  registerAdmins,
  registerReviewDetails,
  updatePartnerStatus,
} from "../controllers/partnersController.js";
import upload from "../utils/multer.js";
import uploadSingle from "../middlewires/uploadMiddleWare.js";
const router = express.Router();

uploadSingle;
router.get("/", getPartners);
router.post("/register/", registerPartners);
router.post("/register/admin", registerAdmins);
router.post(
  "/register/review-details",
  uploadSingle("logo"),
  registerReviewDetails
);
router.patch("/:id/status", updatePartnerStatus);

export default router;
