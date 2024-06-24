import express from "express";
import { CreateProduction, ViewProductionById, updateCreateProduction, updateReturnProduction, viewProductionDetails } from "../controller/production.controller.js";

const router = express.Router();

router.post("/save-production", CreateProduction)
router.get("/view-production/:id/:database", viewProductionDetails)
router.get("/view-production-by-id/:id", ViewProductionById);
router.put("/update-production-items/:id", updateCreateProduction)

router.put("/updated-return-production/:id",updateReturnProduction)

export default router;