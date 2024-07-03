import express from "express";
import path from "path"
import { Attendance, AttendanceList, AttendanceListById, CreateCollection, UserRecognition, UserRegister, saveAttendence, saveImage, viewAttendence, viewEmployee } from "../controller/attendence.controller.js";
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

router.post("/save-attendence", saveAttendence);
router.get("/view-attendence", viewAttendence);
router.post("/save-image", upload.single("file"), saveImage)
router.get("/view-employee", viewEmployee)

router.get("/attendance-list/:database", Attendance)
router.post("/register", UserRegister)
router.post("/recongnition", UserRecognition)
router.post("/create-collection", CreateCollection)
router.get("/attendance-list-by-id/:id", AttendanceListById)
router.get("/attendancelist/:database", AttendanceList)

export default router;