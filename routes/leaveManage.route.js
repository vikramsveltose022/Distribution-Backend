import express from "express";
import { SaveData, ViewData, deleteLeave, updatedLeaveMange, viewLeaveById } from "../controller/leaveMange.controller.js";

const router = express.Router()

router.post("/save-data", SaveData)
router.get("/view-leave/:database", ViewData)
router.get("/view-leave-by-id/:id", viewLeaveById)
router.delete("/delete-leave/:id", deleteLeave)
router.put("/updated-leave/:id", updatedLeaveMange)


export default router;