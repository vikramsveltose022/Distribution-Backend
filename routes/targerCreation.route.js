import express from "express";
import { Achievement, DeleteTargetCreation, SaveTargetCreation, UpdateTargetCreation, ViewTargetCreation, ViewTargetCreationById, called, checkTarget, deleteProductFromTargetCreation, increasePercentage, latestAchievement, latestAchievementById, latestAchievementSalesById, targetCreationXml, updateTargetProducts, viewTarget } from "../controller/targetCreation.controller.js";

const router = express.Router();

router.get("/get-xml", targetCreationXml)
router.post("/save-target-creation", SaveTargetCreation);
router.get("/view-target-creation/:id/:database", ViewTargetCreation);
router.delete("/delete-target-creation/:id", DeleteTargetCreation);
router.put("/update-target-creation/:id", UpdateTargetCreation);
router.get("/view-target-creation-by-id/:id", ViewTargetCreationById)
router.delete('/:targetId/product/:productId', deleteProductFromTargetCreation);

router.get("/target-achieve/:id/:database", Achievement)
router.put("/update-productItems/:id", updateTargetProducts)

router.get("/increase-target", increasePercentage)
router.get("/view-target/:id", viewTarget)

router.post("/target-achievement/:database", latestAchievement)
router.post("/target-achievement-party/:id/:database", latestAchievementById)
router.post("/target-achievement-sales-person/:id/:database", latestAchievementSalesById)
router.post("/achievements/:id/:database", called)
// router.post("/test", yes)
router.post("/check/:id/:database", checkTarget)
export default router;