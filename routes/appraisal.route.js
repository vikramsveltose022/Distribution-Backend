import express from "express"
import { deleteAppraisal, saveAppraisal, updatedAppraisal, viewAppraisal, viewAppraisalById } from "../controller/appraisal.controller.js";

const router = express.Router();

router.post("/save-appraisal", saveAppraisal)
router.get("/view-appraisal/:database", viewAppraisal)
router.get("/view-appraisal-by-id/:id", viewAppraisalById)
router.delete("/delete-appraisal/:id", deleteAppraisal)
router.put("/update-appraisal/:id", updatedAppraisal)

export default router;