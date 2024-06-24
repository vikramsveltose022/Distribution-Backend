import express from "express"
import { deleteLeave, saveLeave, updatedLeave, viewLeave, viewLeaveById } from "../controller/leaveHRM.controller.js"

const router = express.Router()

router.post("/save-leave", saveLeave)
router.get("/view-leave/:database", viewLeave)
router.get("/view-leave-by-id/:id", viewLeaveById)
router.delete("/delete-leave/:id", deleteLeave)
router.put("/update-leave/:id", updatedLeave)

export default router;