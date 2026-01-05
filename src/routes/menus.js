import express from "express";
import { getMenus } from "../controllers/menus.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getMenus);

export default router;
