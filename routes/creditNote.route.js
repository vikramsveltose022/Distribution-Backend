import express from "express";
import { CreditDebitNoteReport, SaveCreditNote, viewCreateNote, viewCreditNoteById } from "../controller/creditNote.controller.js";

const router = express.Router();

router.post("/save-credit-note", SaveCreditNote);
router.get("/view-credit-note/:database", viewCreateNote);
router.post("/view-credit-note-by-id", viewCreditNoteById);
router.post("/cdnr-report/:database", CreditDebitNoteReport)

export default router;