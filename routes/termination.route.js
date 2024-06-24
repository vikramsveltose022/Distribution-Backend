import express from "express"
import { deleteTermination, saveTermination, updatedTermination, viewTermination, viewTerminationById } from "../controller/termination.controller.js"

const router = express.Router()

router.post("/save-termination", saveTermination)
router.get("/view-termination/:database", viewTermination)
router.get("/view-termination-by-id/:id", viewTerminationById)
router.delete("/delete-termination/:id", deleteTermination)
router.put("/update-termination/:id", updatedTermination)

export default router;