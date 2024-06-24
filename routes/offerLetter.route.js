import express from "express";
import { deleteOfferLetter, saveOfferLetter, updatedOfferLetter, viewOfferLetter, viewOfferLetterById } from "../controller/offerLetter.controller.js";

const router = express.Router();

router.post("/save-offer-letter", saveOfferLetter)
router.get("/view-offer-letter/:database", viewOfferLetter)
router.get("/view-offer-letter-by-id/:id", viewOfferLetterById)
router.delete("/delete-offer-letter/:id", deleteOfferLetter)
router.put("/update-offer-letter/:id", updatedOfferLetter)

export default router;