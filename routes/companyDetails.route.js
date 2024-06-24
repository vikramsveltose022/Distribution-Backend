import express from "express";
import { saveCompanyDetails, viewCompanyDetails } from "../controller/companyDetails.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })

router.post("/save-company-details", upload.any("files"), saveCompanyDetails);
router.get("/view-company-details/:id/:database", viewCompanyDetails);

export default router;