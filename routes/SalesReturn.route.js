import express from "express";
import { deleteSalesReturnCreateOrder, saveSalesReturnCreateOrder,updateSalesReturnCreateOrder,viewSalesReturnCreateOrder, viewSalesReturnCreateOrderById } from "../controller/SalesReturn.controller.js";

const router = express.Router();

router.post("/save-sales-return-createorder", saveSalesReturnCreateOrder)
router.get("/view-sales-return-createorder/:id/:database", viewSalesReturnCreateOrder);
router.get("/view-sales-return-createorder-by-id/:id", viewSalesReturnCreateOrderById)
router.delete("/delete-sales-return-createorder/:id", deleteSalesReturnCreateOrder);
router.put("/update-sales-return-createorder/:id", updateSalesReturnCreateOrder);

export default router;