import express from "express";
import { OrderXml, ProductWiseSalesReport, SalesOrderList, autoBillingLock, checkPartyOrderLimit, createOrder, createOrderHistory, createOrderHistoryById, createOrderHistoryByPartyId, createOrderHistoryByUserId, deleteSalesOrder, placeOrder, placeOrderHistory, placeOrderHistoryByUserId, updateCreateOrder, updateCreateOrderStatus, updatePlaceOrder, updatePlaceOrderStatus } from "../controller/order.controller.js";

const router = express.Router();

router.get("/get-xml", OrderXml);

router.post("/save-place-order", placeOrder);
router.get("/view-place-order/:id", placeOrderHistory);
router.get("/view-place-order-by-id/:id", placeOrderHistoryByUserId);
router.put("/update-place-order/:id", updatePlaceOrder);
router.put("/update-place-order-status/:id", updatePlaceOrderStatus);

router.post("/save-create-order", createOrder);
router.get("/view-create-order-history/:id", createOrderHistory);
router.get("/view-create-order-history-by-id/:id", createOrderHistoryByUserId);
router.delete("/delete-sales-order/:id",deleteSalesOrder)
router.get("/view-sales-by-id/:id", createOrderHistoryByPartyId);
router.put("/update-create-order/:id", updateCreateOrder);
router.put("/update-create-order-status/:id", updateCreateOrderStatus);
router.get("/sales-order-by-id/:id", createOrderHistoryById)
router.get("/billing/:id", autoBillingLock)
router.get("/view-sales-order/:id/:database", SalesOrderList);

router.get("/check-party-limit/:id", checkPartyOrderLimit)
router.post("/product-sales-report/:database", ProductWiseSalesReport)

export default router;