import express from "express";
import { CreditDebitNoteReport, viewCreateNote, viewCreditNoteById } from "../controller/creditNote.controller.js";

const router  = express.Router();

router.get("/view-credit-note/:id", viewCreateNote);
router.post("/view-credit-note-by-id",viewCreditNoteById);
router.post("/cdnr-report/:database",CreditDebitNoteReport)

export default router;