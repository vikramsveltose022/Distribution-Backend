import express from "express"
import { deleteWarning, saveWarning, updatedWarning, viewWarning, viewWarningById } from "../controller/warning.controller.js"

const router = express.Router()

router.post("/save-warning", saveWarning)
router.get("/view-warning/:database", viewWarning)
router.get("/view-warning-by-id/:id", viewWarningById)
router.delete("/delete-warning/:id", deleteWarning)
router.put("/update-warning/:id", updatedWarning)

export default router;