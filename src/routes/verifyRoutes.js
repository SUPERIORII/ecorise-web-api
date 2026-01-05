import express from "express";
import { resendCode, verifyCode } from "../controllers/verifyController.js";
const router = express.Router();

// VERIFY USER BY CODE SENT TO MAIL
router.post("/activation-code", verifyCode);
router.post("/resend-code", resendCode);

export default router;
