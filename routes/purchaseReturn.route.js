import express from "express";
import { PurchaseReturnXml, deletePurchaseReturn, savePurchaseReturnOrder, updatePurchaseReturn, viewPurchaseReturn, viewPurchaseReturnByUserId } from "../controller/purchaseReturn.controller.js";

const router = express.Router();

router.get("/get-xml", PurchaseReturnXml)
router.post("/save-purchase-return", savePurchaseReturnOrder);
router.get("/view-purchase-return/:id/:database", viewPurchaseReturn);
router.get("/view-purchase-return-by-id/:id", viewPurchaseReturnByUserId);
router.delete("/delete-purchase-return/:id", deletePurchaseReturn);
router.put("/update-purchase-return/:id", updatePurchaseReturn)

export default router;