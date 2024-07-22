import express from "express";
import path from "path"
import { SaveInvoiceList, SavePurchaseInvoice, UpdatedInvoice, updateOrderInvoiceStatus, viewInvoiceList, viewInvoiceListPurchase } from "../controller/createInvoice.controller.js";
import multer from "multer";

const router = express.Router();
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

// router.post("/save-invoice/:id", upload.any("files"), SaveInvoiceList);
router.post("/save-invoice/:id", SaveInvoiceList);
router.get("/view-invoice/:id/:database", viewInvoiceList);
router.put("/update-invoice/:id", UpdatedInvoice)
router.put("/update-status/:id", updateOrderInvoiceStatus)
router.post("/save-purchase-invoice/:id", SavePurchaseInvoice)
router.get("/view-invoice-purchase/:database", viewInvoiceListPurchase);
// router.post("/testing",Closing)
export default router;