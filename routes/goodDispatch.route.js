import express from "express";
import { GoodDispathcXml, deleteGoodDispatch, saveGoodDispatch, sendOtp, updateGoodDispatch, updateOrderStatusByDeliveryBoy, viewGoodDispatch, viewGoodDispatchById, viewOrderForDeliveryBoy } from "../controller/goodDispatch.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })

router.get("/get-xml", GoodDispathcXml)
router.post("/save-good-dispatch", upload.any("files"), saveGoodDispatch)
router.get("/view-good-dispatch/:id/:database", viewGoodDispatch);
router.get("/view-good-dispatch-by-id/:id", viewGoodDispatchById);
router.delete("/delete-good-dispatch/:id", deleteGoodDispatch);
router.put("/update-good-dispatch/:id", upload.any("files"), updateGoodDispatch)

router.get("/view-order-list/:id/:database", viewOrderForDeliveryBoy)
router.get("/send-otp/:id", sendOtp)
router.post("/verify-authentication/:id", updateOrderStatusByDeliveryBoy);

export default router;