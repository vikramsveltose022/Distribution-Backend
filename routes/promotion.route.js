import express from "express";
import { deleteActivity, deletePromotion, PromotionApply, SaveActivity, SavePromotion, UpdatedActivity, UpdatedPromotion, UpdatedPromotionProductWise, ViewActivity, ViewActivityById, ViewPromotion, ViewPromotionById } from "../controller/promotion.controller.js";

const router = express.Router();

router.post("/save-activity", SaveActivity)
router.get("/view-activity/:database", ViewActivity)
router.get("/view-activity-by-id/:id", ViewActivityById)
router.delete("/delete-activity/:id", deleteActivity)
router.put("/update-activity/:id", UpdatedActivity)

router.post("/save-promotion", SavePromotion);
router.get("/view-promotion/:id/:database", ViewPromotion)
router.get("/view-promotion-by-id/:id", ViewPromotionById)
router.put("/update-promotion/:id", UpdatedPromotion)
router.put("/update-product-promotion/:id", UpdatedPromotionProductWise)
router.delete("/delete-promotion/:id", deletePromotion)
router.post("/promotion-apply/:database", PromotionApply)

export default router;