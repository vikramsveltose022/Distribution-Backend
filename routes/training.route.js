import express from "express";
import { DeleteTrainingDetail, SaveTraining, UpdatedTrainingDetail, ViewTraining, ViewTrainingById } from "../controller/training.controller.js";

const router = express.Router()

router.post("/save-training-detail", SaveTraining)
router.get("/view-training-detail/:database", ViewTraining)
router.get("/view-training-by-id/:id", ViewTrainingById)
router.delete("/delete-training-detail/:id", DeleteTrainingDetail)
router.put("/update-training-detail/:id", UpdatedTrainingDetail)

export default router;