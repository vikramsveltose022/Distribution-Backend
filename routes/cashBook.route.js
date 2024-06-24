import express from "express";
import { OrderHistory, cashBookOrder, placeOrderHistoryByUserId, updateCashBookOrderStatus } from "../controller/cashBook.controller.js";

const router = express.Router();

router.post("/cashbook-order", cashBookOrder);
router.get("/view-cashbook/:id", placeOrderHistoryByUserId)
router.get("/view-order-list/:id/:database", OrderHistory);
router.put("/update-status/:id", updateCashBookOrderStatus)

export default router;