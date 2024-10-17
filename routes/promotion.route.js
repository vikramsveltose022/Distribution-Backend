import express from "express";
import { deletePromotion, SavePromotion, UpdatedPromotion, ViewPromotion, ViewPromotionById } from "../controller/promotion.controller.js";

const router = express.Router();

router.post("/save-promotion", SavePromotion);
router.get("/view-promotion/:id/:database", ViewPromotion)
router.get("/view-promotion-by-id/:id", ViewPromotionById)
router.put("/update-promotion/:id", UpdatedPromotion)
router.delete("/delete-promotion/:id", deletePromotion)

export default router;