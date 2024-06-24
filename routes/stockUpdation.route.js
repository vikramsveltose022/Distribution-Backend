import express from "express";
import { ViewAllWarehouse, ViewAllWarehouse1, ViewDeadParty, ViewOverDueStock, deletedamageItem, getDamageItems, saveDamageItem, stockTransferToWarehouse, updateDamageItem, updateTypeStatus, updateWarehousetoWarehouse, viewInWardStockToWarehouse, viewOpeningStockWarehouse, viewOutWardStockToWarehouse, viewProductInWarehouse, viewStockClosingWarehouse, viewWarehouseStock } from "../controller/stockUpdation.controller.js";

const router = express.Router();

router.post("/stock-transfer-warehouse", stockTransferToWarehouse)
router.get("/view-in-ward-stock/:id", viewInWardStockToWarehouse)
router.get("/view-out-ward-stock/:id", viewOutWardStockToWarehouse)

router.get("/view-warehouse-stock/:database", viewWarehouseStock)
router.put("/update-warehoue-to-warehouse/:id", updateWarehousetoWarehouse)
router.get("/product-list/:id", viewProductInWarehouse)

//-------------------------------------
router.post("/save-damage-item", saveDamageItem);
router.get("/get-damage-item/:id", getDamageItems);
router.put("/update-damageItem/:warehouseId/:damageItemId", updateDamageItem)
router.delete("/delete-item/:warehouseId/:damageItemId", deletedamageItem);
router.put("/update-status/:id", updateTypeStatus)
//---------------------------------------------------------
router.get("/all-warehouse", ViewAllWarehouse)
router.get("/view-closing-stock/:database", viewStockClosingWarehouse)
router.get("/view-opening-stock/:database", viewOpeningStockWarehouse)
router.get("/view-over-due-stock/:database", ViewOverDueStock)
router.get("/view-dead-party/:id/:database", ViewDeadParty)

router.get("/testing", ViewAllWarehouse1)

export default router;