import express from "express";
import path from "path"
import { DeleteTransporter, SaveTransporter, UpdateExcelTransporter, UpdateTransporter, ViewTransporter, ViewTransposrterById, saveExcelFile } from "../controller/transporter.controller.js";
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


// router.post("/transporter-data", uploads.single('file'), saveExcelFile)
router.post("/transporter-data/:database", uploads.single('file'), saveExcelFile)
router.post("/update-import-transporter/:database", uploads.single('file'), UpdateExcelTransporter)

router.post("/save-transporter", upload.single("file"), SaveTransporter);
router.get("/view-transporter/:database", ViewTransporter);
router.get("/view-transporter-by-id/:id", ViewTransposrterById)
router.delete("/delete-transporter/:id", DeleteTransporter)
router.put("/update-transporter/:id", upload.single("file"), UpdateTransporter)

export default router;