import express from "express"
import { DeleteProductItems, SaveProductItem, UpdateProductItems, ViewProductItem, ViewProductItemsById } from "../controller/warehouseProductItem.controller.js";

const router = express.Router();

router.post("/save-items", SaveProductItem)
router.get("/view-items", ViewProductItem)
router.get("/view-items-by-id/:id", ViewProductItemsById)
router.delete("/delete-items/:id", DeleteProductItems)
router.put("/update-items/:id", UpdateProductItems)

export default router;