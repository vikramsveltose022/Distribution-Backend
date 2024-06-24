import express from "express";
import { deleteJob, saveJob, updateJob, viewJob, viewJobById } from "../controller/createJob.controller.js";

const router = express.Router();

router.post("/save-job", saveJob);
router.get("/view-job/:database", viewJob);
router.get("/view-job-by-id/:id", viewJobById);
router.delete("/delete-job/:id", deleteJob);
router.put("/update-job/:id", updateJob)

export default router;