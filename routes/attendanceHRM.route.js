import express from "express"
import { deleteAttendance, saveAttendance, updatedAttendance, viewAttendance, viewAttendanceById } from "../controller/attendanceHRM.controller.js";

const router = express.Router()

router.post("/save-attendance",saveAttendance)
router.get("/view-attendance/:database",viewAttendance)
router.get("/view-attendance-by-id/:id",viewAttendanceById)
router.delete("/delete-attendance/:id",deleteAttendance)
router.put("/update-attendance/:id",updatedAttendance)

export default router;