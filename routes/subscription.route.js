import express from "express"
import { DeleteDetail, SaveDetails, UpdateDetails, ViewDetailById, ViewDetails } from "../controller/subscription.controller.js";

const router = express.Router();

router.post("/save-detail", SaveDetails)
router.get("/view-detail", ViewDetails)
router.get("/view-detail-by-id/:id", ViewDetailById)
router.delete("/delete-detail/:id", DeleteDetail)
router.put("/update-detail/:id", UpdateDetails)

export default router;