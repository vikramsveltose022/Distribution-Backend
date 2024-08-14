import express from "express";
import path from "path"
import { OrderCancelWarehouse, ProductInWarehouse, ViewOtp, ViewWarehouseByOrder, ViewWarehouseOrderCancel, ViewWarehouseOrderCompletedOrCancel, deleteGoodDispatch, saveGoodDispatch, sendOtp, updateGoodDispatch, updateOrderStatusByDeliveryBoy, viewGoodDispatch, viewGoodDispatchById, viewOrderForDeliveryBoy } from "../controller/goodDispatch.controller.js";
import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "public/Images/" })
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

router.post("/save-good-dispatch", upload.any("files"), saveGoodDispatch)
router.get("/view-good-dispatch/:id/:database", viewGoodDispatch);
router.get("/view-good-dispatch-by-id/:id", viewGoodDispatchById);
router.delete("/delete-good-dispatch/:id", deleteGoodDispatch);
router.put("/update-good-dispatch/:id", upload.any("files"), updateGoodDispatch)

router.get("/view-order-list/:id/:database", viewOrderForDeliveryBoy)
router.post("/send-otp/:id", sendOtp)
router.get("/view-otp/:id", ViewOtp)
router.post("/verify-authentication/:id", upload.single("file"), updateOrderStatusByDeliveryBoy);
router.get("/view-order-warehouse/:id", ViewWarehouseByOrder);
router.get("/view-cancel-order-warehouse/:id", ViewWarehouseOrderCancel);
router.get("/cancel-warehouse-order/:id/:productId", OrderCancelWarehouse);
router.get("/view-warehouse-order-history/:id", ViewWarehouseOrderCompletedOrCancel);
router.get("/product-warehouse/:productId", ProductInWarehouse);

export default router;