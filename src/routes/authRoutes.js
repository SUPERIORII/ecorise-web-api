import express from "express";
const router = express.Router();
import { register, login, logout } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";
import {isSuperAdmin} from "../middlewires/roleCheck.js";


router.post("/register", isAuthenticated, isSuperAdmin, register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
