import express from "express";
import { SaveDebitNote, viewDebitNote, viewDebitNoteById } from "../controller/debitNote.controller.js";

const router = express.Router();

router.post("/save-debit-note", SaveDebitNote);
router.get("/view-debit-note/:database", viewDebitNote);
router.get("/view-debit-note-by-id/:id", viewDebitNoteById)

export default router;