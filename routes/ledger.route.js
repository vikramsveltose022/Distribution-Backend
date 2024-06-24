import express from "express";
import { viewLedgerByParty, viewLedgerByUser } from "../controller/ledger.controller.js";

const router = express.Router();

router.get("/view-ledger-user/:id", viewLedgerByUser);
router.get("/view-ledger-party/:id", viewLedgerByParty)

export default router;