import express from "express";
const router = express.Router();
import { getAllUsers, authUser } from "../controllers/userController.js";

getAllUsers;
// GET ALL USERS FROM SYSTEM
router.get("/", getAllUsers);

router.get("/profile", authUser);

export default router;
