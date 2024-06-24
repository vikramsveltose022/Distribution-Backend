import express from "express";
import { deleteJobBatch, deleteJobCategory, saveJobBatch, saveJobCategory, updatedJobBatch, updatedJobCategory, viewJobBatch, viewJobBatchById, viewJobCategory, viewJobCategoryById } from "../controller/jobCategory.controller.js";

const router = express.Router();

router.post("/save-job-category", saveJobCategory)
router.get("/view-job-category/:database", viewJobCategory)
router.get("/view-job-category-by-id/:id", viewJobCategoryById)
router.delete("/delete-job-category/:id", deleteJobCategory)
router.put("/update-job-category/:id", updatedJobCategory)

//---------------------------------------------------------------------------------------
router.post("/save-job-branch", saveJobBatch)
router.get("/view-job-branch/:database", viewJobBatch)
router.get("/view-job-branch-by-id/:id", viewJobBatchById)
router.delete("/delete-job-branch/:id", deleteJobBatch)
router.put("/update-job-branch/:id", updatedJobBatch)

export default router;