import express from "express"
import { deleteIncentive, saveIncentive, updatedIncentive, viewIncentive, viewIncentiveById } from "../controller/incentive.controller.js";

const router = express.Router();

router.post("/save-incentive", saveIncentive)
router.get("/view-incentive/:database", viewIncentive)
router.get("/view-incentive-by-id/:id", viewIncentiveById)
router.delete("/delete-incentive/:id", deleteIncentive)
router.put("/update-incentive/:id", updatedIncentive)

export default router;