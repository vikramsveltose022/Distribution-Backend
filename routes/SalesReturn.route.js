import express from "express";
import { deleteSalesReturn, deleteSalesReturnCreateOrder, saveSalesReturnCreateOrder, saveSalesReturnOrder, updateSalesReturnCreateOrder, updateSalesReturnOrder, viewSalesReturn, viewSalesReturnById, viewSalesReturnCreateOrder, viewSalesReturnCreateOrderById } from "../controller/SalesReturn.controller.js";

const router = express.Router();

router.post("/save-sales-return", saveSalesReturnOrder)
router.get("/view-sales-return/:id/:database", viewSalesReturn);
router.get("/view-sales-return-by-id/:id", viewSalesReturnById)
router.delete("/delete-sales-return/:id", deleteSalesReturn);
router.put("/update-sales-return/:id", updateSalesReturnOrder);

router.post("/save-sales-return-createorder", saveSalesReturnCreateOrder)
router.get("/view-sales-return-createorder/:id/:database", viewSalesReturnCreateOrder);
router.get("/view-sales-return-createorder-by-id/:id", viewSalesReturnCreateOrderById)
router.delete("/delete-sales-return-createorder/:id", deleteSalesReturnCreateOrder);
router.put("/update-sales-return-createorder/:id", updateSalesReturnCreateOrder);

export default router;