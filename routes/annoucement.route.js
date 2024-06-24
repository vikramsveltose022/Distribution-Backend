import express from "express"
import { deleteAnnoucement, saveAnnoucement, updatedAnnoucement, viewAnnoucement, viewAnnoucementById } from "../controller/annoucement.controller.js";

const router = express.Router()

router.post("/save-annoucement", saveAnnoucement)
router.get("/view-annoucement/:database", viewAnnoucement)
router.get("/view-annoucement-by-id/:id", viewAnnoucementById)
router.delete("/delete-annoucement/:id", deleteAnnoucement)
router.put("/update-annoucement/:id", updatedAnnoucement)

export default router;