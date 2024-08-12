import express from "express";
import { DeleteWarehouse, HSNStockSummary, SaveWarehouse, SignIn, StockCalculate, UpdateWarehouse, ViewWarehouse, ViewWarehouseById, ViewWarehouseForProduct, ViewWarehouseList, ViewWarehouseListIncharge, WarehouseDifferenceReport, WarehouseReport, getWarehouseData, savedd } from "../controller/warehouse.controller.js";

const router = express.Router();

router.post("/save-warehouse", SaveWarehouse);
router.post("/signin", SignIn);
router.get("/view-warehouse/:database", ViewWarehouse);
router.get("/view-warehouse-product/:database", ViewWarehouseForProduct)
router.get("/view-warehouse-by-id/:id", ViewWarehouseById);
router.get("/view-warehouse-list/:database", ViewWarehouseList);
router.delete("/delete-warehouse/:id", DeleteWarehouse);
router.put("/update-warehouse/:id", UpdateWarehouse);

router.get("/view-warehouse-stock/:id", getWarehouseData)
router.get("/view-warehouse-list-incharge/:id/:database", ViewWarehouseListIncharge);
router.post("/warehouse-report/:database", WarehouseReport)
router.post("/warehouse-difference/:database", WarehouseDifferenceReport)

router.post("/hsn-stock-summary/:database", HSNStockSummary)

router.get("/stock-calculate/:database", StockCalculate)
router.get("/saved/:database", savedd)
export default router;