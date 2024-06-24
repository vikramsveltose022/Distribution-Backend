import express from "express";
import { saveEmployeeDetails, viewEmployeeDetail } from "../controller/employee.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })

router.post("/save-employee", upload.any("files"), saveEmployeeDetails);
router.get("/view-employee", viewEmployeeDetail)

export default router;