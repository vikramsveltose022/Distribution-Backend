import express from "express"
import { deleteComplaint, saveComplaint, updatedComplaint, viewComplaint, viewComplaintById } from "../controller/complain.controller.js"

const router = express.Router()

router.post("/save-complaint", saveComplaint)
router.get("/view-complaint/:database", viewComplaint)
router.get("/view-complaint-by-id/:id", viewComplaintById)
router.delete("/delete-complaint/:id", deleteComplaint)
router.put("/update-complaint/:id", updatedComplaint)

export default router;