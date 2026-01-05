import { addDeleteLikes, getLikes } from "../controllers/likesController.js";
import express from "express";
const router = express.Router();

router.get("/", getLikes);
router.post("/", addDeleteLikes);

export default router;
