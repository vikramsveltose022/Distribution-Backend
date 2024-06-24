import express from "express"
import { deleteResignation, saveResignation, updatedResignation, viewResignation, viewResignationById } from "../controller/resignation.controller.js"

const router = express.Router()

router.post("/save-resignation", saveResignation)
router.get("/view-resignation/:database", viewResignation)
router.get("/view-resignation-by-id/:id", viewResignationById)
router.delete("/delete-resignation/:id", deleteResignation)
router.put("/update-resignation/:id", updatedResignation)

export default router;