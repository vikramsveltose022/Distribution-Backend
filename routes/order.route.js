import express from "express";
import { DebitorCalculate, OrdertoBilling, OrdertoDispatch, PartyPurchaseqty, ProductWiseSalesReport, SalesOrderCalculate, SalesOrderList, ViewOrderHistoryForPartySalesPerson, checkPartyOrderLimit, createOrder, createOrderHistory, createOrderHistoryById, createOrderHistoryByPartyId, createOrderHistoryByUserId, deleteSalesOrder, deletedSalesOrder, updateCreateOrder, updateCreateOrderStatus } from "../controller/order.controller.js";

const router = express.Router();

router.post("/save-create-order", createOrder);
router.get("/view-create-order-history/:id", createOrderHistory);
router.get("/view-create-order-history-by-id/:id", createOrderHistoryByUserId);
router.delete("/delete-sales-order/:id", deleteSalesOrder)
router.get("/view-sales-by-id/:id", createOrderHistoryByPartyId);
router.put("/update-create-order/:id", updateCreateOrder);
router.put("/update-create-order-status/:id", updateCreateOrderStatus);
router.post("/order-billing/:id", OrdertoBilling)
router.post("/order-dispatch/:id", OrdertoDispatch)
router.get("/sales-order-by-id/:id", createOrderHistoryById)
router.get("/view-sales-order/:id/:database", SalesOrderList);
router.get("/view-order-party/:id", ViewOrderHistoryForPartySalesPerson);

router.get("/check-party-limit/:id", checkPartyOrderLimit)
router.post("/product-sales-report/:database", ProductWiseSalesReport)

router.delete("/delete-sales/:id", deletedSalesOrder)
router.get("/party-qty/:partyId/:productId", PartyPurchaseqty)

// --------------------------------------------------------------
router.get("/sales-calculated/:database", SalesOrderCalculate)
router.get("/debitor-calculate/:database", DebitorCalculate)

export default router;