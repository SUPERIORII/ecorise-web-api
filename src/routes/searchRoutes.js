import express from "express"
import {searchAllUsers } from "../controllers/searchController.js"
const router = express.Router()


router.get("/", searchAllUsers)

export default router