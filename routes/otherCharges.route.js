import express from "express";
import { deleteOtherCharges, saveOtherCharges, updatedOtherCharges, viewOtherCharges, viewOtherChargesById } from "../controller/otherCharges.controller.js";

const router = express.Router()

router.post("/save-other-charges", saveOtherCharges)
router.get("/view-other-charges/:database", viewOtherCharges)
router.get("/view-other-charges-by-id/:id", viewOtherChargesById)
router.delete("/delete-other-charges/:id", deleteOtherCharges)
router.put("/update-other-charges/:id", updatedOtherCharges)

export default router