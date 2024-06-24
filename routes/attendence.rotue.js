import express from "express";
import { saveAttendence, saveImage, viewAttendence, viewEmployee } from "../controller/attendence.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images/" })

router.post("/save-attendence", saveAttendence);
router.get("/view-attendence", viewAttendence);
router.post("/save-image", upload.single("file"), saveImage)
router.get("/view-employee", viewEmployee)

export default router;