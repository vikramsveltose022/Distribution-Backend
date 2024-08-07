import express from "express";
import { BankAccountReport, CashBookReport, DeletePayment, DeleteReceipt, OtpVerifyForReceipt, PartySendOtp, ProfitLossReport, SaveOtp, TaxReport, UpdatePayment, UpdateReceipt, ViewOtp, ViewReceiptById, ViewReceiptByPartyId, savePayment, savePaymentWithExcel, saveReceipt, saveReceiptWithExcel, transactionCalculate, viewReceipt } from "../controller/receipt.controller.js";
import multer from "multer";

const router = express.Router();
const uploads = multer({ dest: "public/ExcelFile/" })

router.post("/save-receipt", saveReceipt);
router.post("/save-payment", savePayment)
router.get("/view-reciept/:database", viewReceipt)
router.get("/view-receipt-by-id/:id", ViewReceiptById)
router.delete("/delete-receipt/:id", DeleteReceipt);
router.put("/update-receipt/:id", UpdateReceipt)
router.put("/update-payment/:id", UpdatePayment)
router.delete("/delete-payment/:id", DeletePayment);

router.post("/profit-loss-report/:database", ProfitLossReport)

router.post("/reciept-data/:database", uploads.single('file'), saveReceiptWithExcel)
router.post("/payment-data/:database", uploads.single('file'), savePaymentWithExcel)
// router.post("/reciept-data", uploads.single('file'), saveReceiptWithExcel)
// router.post("/payment-data", uploads.single('file'), savePaymentWithExcel)

router.post("/cash-book-report/:database", CashBookReport)
router.post("/bank-account-report/:database", BankAccountReport)
router.post("/tax-report/:database", TaxReport)

router.post("/receipt-generate", PartySendOtp)
router.post("/otp-verify", OtpVerifyForReceipt)
router.post("/view-otp", ViewOtp)
router.post("/save-otp", SaveOtp)
router.get("/view-party-receipt/:id/:database", ViewReceiptByPartyId)

router.get("/transaction-calculate/:database", transactionCalculate)

export default router;