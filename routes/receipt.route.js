import express from "express";
import { BankAccountReport, CashBookReport, DeleteReceipt, ProfitLossReport, TaxReport, UpdateReceipt, ViewReceiptById, savePayment, savePaymentWithExcel, saveReceipt, saveReceiptWithExcel, viewReceipt } from "../controller/receipt.controller.js";
import multer from "multer";

const router = express.Router();
const uploads = multer({ dest: "public/ExcelFile/" })

router.post("/save-receipt", saveReceipt);
router.post("/save-payment", savePayment)
router.get("/view-reciept/:database", viewReceipt)
router.get("/view-receipt-by-id/:id", ViewReceiptById)
router.delete("/delete-receipt/:id", DeleteReceipt);
router.put("/update-receipt/:id", UpdateReceipt)

router.post("/profit-loss-report/:database", ProfitLossReport)

router.post("/reciept-data", uploads.single('file'), saveReceiptWithExcel)
router.post("/payment-data", uploads.single('file'), savePaymentWithExcel)

router.post("/cash-book-report/:database", CashBookReport)
router.post("/bank-account-report/:database", BankAccountReport)
router.post("/tax-report/:database", TaxReport)

export default router;