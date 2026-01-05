import express from "express";
const router = express.Router();
import { getResources, getAllResources } from "../controllers/resources.js";

router.get("/latest-resources", getResources);
router.get("/full-resources", getAllResources);

export default router;
