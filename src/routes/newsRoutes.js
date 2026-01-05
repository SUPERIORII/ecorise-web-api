import express from "express";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();
import { addNews, getnews } from "../controllers/newsController.js";

router.post("/", isAuthenticated, addNews);
router.get("/", getnews);

export default router;
