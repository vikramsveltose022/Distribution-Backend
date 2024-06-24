import express from "express";
import multer from "multer";
import { QuotationSaved, ViewQuotation, ViewQuotationById, ViewQuotationByUserId } from "../controller/quotation.controller.js";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })

router.post("/save-quotation", QuotationSaved)
router.get("/view-quotation/:database", ViewQuotation)
router.get("/view-quotation-by-id/:id", ViewQuotationById)
router.get("/view-quotation-by-userId/:userId", ViewQuotationByUserId)

export default router;