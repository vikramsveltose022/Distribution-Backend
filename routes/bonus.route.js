import express from "express"
import { bonus, deleteBonus, getBonus, updatedBonus, viewBonus, viewBonusById } from "../controller/bonus.controller.js";

const router = express.Router()

router.post("/save-bonus", bonus);
router.get("/view-bonus/:database", viewBonus)
router.get("/view-bonus-by-id/:id", viewBonusById)
router.delete("/delete-bonus/:id", deleteBonus)
router.put("/update-bonus/:id", updatedBonus)
router.get("/get-bonus/:id", getBonus)

export default router;