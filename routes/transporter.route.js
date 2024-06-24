import express from "express";
import { DeleteTransporter, SaveTransporter, UpdateTransporter, ViewTransporter, ViewTransposrterById, saveExcelFile } from "../controller/transporter.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" });
const uploads = multer({ dest: "public/ExcelFile/" })


router.post("/transporter-data", uploads.single('file'), saveExcelFile)

router.post("/save-transporter", upload.single("file"), SaveTransporter);
router.get("/view-transporter/:database", ViewTransporter);
router.get("/view-transporter-by-id/:id", ViewTransposrterById)
router.delete("/delete-transporter/:id", DeleteTransporter)
router.put("/update-transporter/:id", upload.single("file"), UpdateTransporter)

export default router;