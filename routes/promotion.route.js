import express from "express";
import { SavePromotion, ViewPromotion } from "../controller/promotion.controller.js";

const router = express.Router();

router.post("/save-promotion", SavePromotion);
router.get("/view-promotion/:id/:database", ViewPromotion)

export default router;