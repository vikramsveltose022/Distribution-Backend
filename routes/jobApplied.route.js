import express from "express";
import { deleteJobApplied, saveJobApplied, updateJobApplice, viewJobApplied, viewJobAppliedById } from "../controller/jobApplied.controller.js";

const router = express.Router();

router.post("/save-job-applied", saveJobApplied);
router.get("/view-job-applied/:database", viewJobApplied);
router.get("/view-job-applied-by-id/:id", viewJobAppliedById);
router.delete("/delete-job-applied/:id", deleteJobApplied);
router.put("/update-job-applied/:id", updateJobApplice)

export default router;