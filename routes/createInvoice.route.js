import express from "express";
import { SaveInvoiceList, SavePurchaseInvoice, UpdatedInvoice, deletedPurchase, updateOrderInvoiceStatus, viewInvoiceList, viewInvoiceListPurchase } from "../controller/createInvoice.controller.js";

const router = express.Router();

router.post("/save-invoice/:id", SaveInvoiceList);
router.get("/view-invoice/:id/:database", viewInvoiceList);
router.put("/update-invoice/:id", UpdatedInvoice)
router.put("/update-status/:id", updateOrderInvoiceStatus)
router.post("/save-purchase-invoice/:id", SavePurchaseInvoice)
router.get("/view-invoice-purchase/:database", viewInvoiceListPurchase);
// router.post("/testing",Closing)
router.delete("/deleted-purchase-order/:id",deletedPurchase)
export default router;