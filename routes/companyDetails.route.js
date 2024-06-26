import express from "express";
import path from "path"
import { saveCompanyDetails, viewCompanyDetails } from "../controller/companyDetails.controller.js";
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

router.post("/save-company-details", upload.any("files"), saveCompanyDetails);
router.get("/view-company-details/:id/:database", viewCompanyDetails);

export default router;