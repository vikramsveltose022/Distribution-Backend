import express from "express";
import { DeleteCustomer, SaveCustomer, SignIn, SignInWithMobile, SuperAdminList, UpdateCustomer, ViewCustomer, ViewCustomerById, dueParty, forgetPassword, lockParty, otpVerify, overDueReport, paymentDueReport, saveExcelFile, updatePassword } from "../controller/customer.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })
const uploads = multer({ dest: "public/ExcelFile/" })

router.post("/party-data", uploads.single('file'), saveExcelFile)

router.post("/save-customer", upload.any("files"), SaveCustomer);
router.get("/view-customer/:id/:database", ViewCustomer);
router.get("/view-customer-by-id/:id", ViewCustomerById);
router.get("/delete-customer/:id", DeleteCustomer);
router.post("/update-customer/:id", upload.any("files"), UpdateCustomer);

router.post("/login", SignInWithMobile)
router.post("/signIn", SignIn)
router.post("/forget-password", forgetPassword)
router.post("/super-admin-list",SuperAdminList)
router.post("/otp-verify", otpVerify)
router.post("/update-password/:id", updatePassword)

router.get("/due-report/:database", dueParty)
router.get("/over-due-report/:database", overDueReport)
router.get("/auto-billing-lock/:database", lockParty)
router.post("/payment-due-report/:database",paymentDueReport)

export default router;