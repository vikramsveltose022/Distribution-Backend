import express from "express";
import { DeleteProduct, HSNWisePurchaseReport, HSNWiseSalesReport, ProductXml, SaveProduct, StockAlert, UpdateProduct, ViewProduct, ViewProductById, ViewProductForPurchase, saveItemWithExcel, viewCurrentStock } from "../controller/product.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" });
const uploads = multer({ dest: "public/ExcelFile/" })

router.get("/get-xml", ProductXml);
router.post("/import-item-data", uploads.single('file'), saveItemWithExcel)

router.post("/save-product", upload.array("files"), SaveProduct)
router.get("/view-product/:id/:database", ViewProduct)
router.get("/view-product-purchase/:database", ViewProductForPurchase)
router.get("/view-product-by-id/:id", ViewProductById)
router.delete("/delete-product/:id", DeleteProduct)
router.put("/update-product/:id", upload.any("file"), UpdateProduct);


router.get("/view-stock-alert/:database", StockAlert);
router.get("/view-current-stock/:id/:productId", viewCurrentStock)

router.post("/hsn-sales-summary/:database", HSNWiseSalesReport)
router.post("/hsn-purchase-summary/:database", HSNWisePurchaseReport)

export default router;