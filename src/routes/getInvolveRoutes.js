import express from "express"
import { getGetInvolved } from "../controllers/getInvolvedController.js"

const router = express.Router()

router.get("/", getGetInvolved)



export default router