import express from "express";
import { DeleteWarehouse, HSNStockSummary, SaveWarehouse, UpdateWarehouse, ViewWarehouse, ViewWarehouseById, ViewWarehouseForProduct, ViewWarehouseList, ViewWarehouseListIncharge, WarehouseDifferenceReport, WarehouseReport, WarehouseXml, getWarehouseData } from "../controller/warehouse.controller.js";

const router = express.Router();

router.get("/get-xml", WarehouseXml);
router.post("/save-warehouse", SaveWarehouse);
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
export default router;