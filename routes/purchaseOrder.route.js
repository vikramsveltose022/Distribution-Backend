import express from "express";
import multer from "multer";
import { CreditorCalculate, ProductWisePurchaseReport, PurchaseOrderDispatch, deletePurchaseOrder, deletedPurchase, purchaseOrder, purchaseOrderHistory, purchaseOrderHistoryByOrderId, updatePurchaseOrder, updatePurchaseOrderStatus } from "../controller/purchageOrder.controller.js";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })

router.post("/save-purchase-order", purchaseOrder)
router.post("/dipatch-purchase-order/:id", PurchaseOrderDispatch)
router.get("/view-purchase-order-history/:id/:database", purchaseOrderHistory)
router.get("/view-purchase-order-history-by-id/:id", purchaseOrderHistoryByOrderId);
router.put("/update-purchase-order/:id", updatePurchaseOrder);
router.put("/update-purchase-order-status/:id", updatePurchaseOrderStatus);
router.post("/product-purchase-report/:database", ProductWisePurchaseReport)
router.delete("/delete-purchase-order/:id", deletePurchaseOrder);
router.delete("/deleted-purchase-order/:id", deletedPurchase)

router.get("/creditor-calculate/:database", CreditorCalculate)
export default router;