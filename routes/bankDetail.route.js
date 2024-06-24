import express from "express"
import { DeleteBankDetail, UpdateBankDetail, ViewBankDetail, ViewBankDetailById, saveBankDetail } from "../controller/bankDetail.controller.js"

const router = express.Router()

router.post("/save-bank-detail", saveBankDetail)
router.get("/view-bank-detail/:database", ViewBankDetail)
router.get("/view-bank-detail-by-id/:id", ViewBankDetailById)
router.delete("/delete-bank-detail/:id", DeleteBankDetail)
router.put("/update-bank-detail/:id", UpdateBankDetail)

export default router