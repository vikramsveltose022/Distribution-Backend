import express from "express";
import { deleteInterview, saveInterview, updateInterview, viewInterview, viewInterviewById } from "../controller/interview.controller.js";

const router = express.Router();

router.post("/save-interview", saveInterview);
router.get("/view-interview/:database", viewInterview);
router.get("/view-interview-by-id/:id", viewInterviewById);
router.delete("/delete-interview/:id", deleteInterview);
router.put("/update-interview/:id", updateInterview)

export default router;