import express from "express";
import path from "path"
import { DeleteProduct, HSNWisePurchaseReport, HSNWiseSalesReport, SaveProduct, StockAlert, UpdateProduct, UpdateProductSalesRate, UpdateProductSalesRateMultiple, ViewProduct, ViewProductById, ViewProductForPurchase, saveItemWithExcel, updateItemWithExcel, viewCurrentStock } from "../controller/product.controller.js";
import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "public/Images/" });
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/Images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});
const upload = multer({ storage: storage });
const uploads = multer({ dest: "public/ExcelFile/" })

router.post("/import-item-data/:database", uploads.single('file'), saveItemWithExcel)
router.post("/update-import-product/:database", uploads.single('file'), updateItemWithExcel)
router.post("/save-product", upload.array("files"), SaveProduct)
router.get("/view-product/:id/:database", ViewProduct)
router.get("/view-product-purchase/:database", ViewProductForPurchase)
router.get("/view-product-by-id/:id", ViewProductById)
router.delete("/delete-product/:id", DeleteProduct)
router.put("/update-product/:id", upload.array("files"), UpdateProduct);
router.get("/view-stock-alert/:database", StockAlert);
router.get("/view-current-stock/:id/:productId", viewCurrentStock)
router.post("/hsn-sales-summary/:database", HSNWiseSalesReport)
router.post("/hsn-purchase-summary/:database", HSNWisePurchaseReport)
router.put("/product-price-update/:id", UpdateProductSalesRate)
router.put("/product-price-updated", UpdateProductSalesRateMultiple)

export default router;