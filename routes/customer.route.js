import express from "express";
import path from "path"
import { AssignLeadParty, DeleteCustomer, LeadPartyList, SaveCustomer, SaveLeadPartyExcel, SignIn, SignInWithMobile, SuperAdminList, UpdateCustomer, ViewCustomer, ViewCustomerById, dueParty, forgetPassword, lockParty, otpVerify, overDueReport, paymentDueReport, saveExcelFile, updateExcelFile, updatePassword } from "../controller/customer.controller.js";
import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "public/Images/" })
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/Images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});
const upload = multer({ storage: storage });
const uploads = multer({ dest: "public/ExcelFile/" })

router.post("/party-data", uploads.single('file'), saveExcelFile)
router.post("/update-customer/:database", uploads.single('file'), updateExcelFile)

router.post("/save-customer", upload.any("files"), SaveCustomer);
router.get("/view-customer/:id/:database", ViewCustomer);
router.get("/view-customer-by-id/:id", ViewCustomerById);
router.get("/delete-customer/:id", DeleteCustomer);
router.post("/update-customer/:id", upload.any("files"), UpdateCustomer);

router.post("/login", SignInWithMobile)
router.post("/signIn", SignIn)
router.post("/forget-password", forgetPassword)
router.post("/super-admin-list", SuperAdminList)
router.post("/otp-verify", otpVerify)
router.post("/update-password/:id", updatePassword)

router.get("/due-report/:database", dueParty)
router.get("/over-due-report/:database", overDueReport)
router.get("/auto-billing-lock/:database", lockParty)
router.post("/payment-due-report/:database", paymentDueReport)

// --------------------------------------------------------------------
router.post("/save-lead-party-bulk", uploads.single("file"), SaveLeadPartyExcel)
router.get("/lead-party-list/:database", LeadPartyList)
router.post("/assign-lead-party", AssignLeadParty)
router.get("/lead-party-list/:id", LeadPartyList)

export default router;