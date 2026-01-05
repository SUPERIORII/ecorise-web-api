import express from "express";
const router = express.Router();
import {
  addProjects,
  getProjects,
  getSingleProject,
} from "../controllers/projectsController.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

router.post("/", isAuthenticated, addProjects);
router.get("/", getProjects);
router.get("/single-project/:slug", getSingleProject);

export default router;
