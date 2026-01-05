import express from "express";
import { getLatestMembers, getAllembers } from "../controllers/members.js";
const router = express.Router();

router.get("/", getAllembers);
router.get("/featured", getLatestMembers);

export default router;
