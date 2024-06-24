import express from "express"
import { deleteIndicator, saveIndicator, updatedIndicator, viewIndicator, viewIndicatorById } from "../controller/indicator.controller.js";

const router = express.Router();

router.post("/save-indicator", saveIndicator)
router.get("/view-indicator/:database", viewIndicator)
router.get("/view-indicator-by-id/:id", viewIndicatorById)
router.delete("/delete-indicator/:id", deleteIndicator)
router.put("/update-indicator/:id", updatedIndicator)

export default router