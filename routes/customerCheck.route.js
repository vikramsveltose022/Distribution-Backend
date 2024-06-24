import express from "express";
import multer from "multer";
import path from "path"
import { checkMarkAttendence, checkSignIn, checkSignUp, checkVerifyPanNo } from "../controller/customerCheck.controller.js";

const customerCheckRouter = express.Router();
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


customerCheckRouter.post("/checkLogin", checkSignIn)
customerCheckRouter.post("/checkPanNo", checkVerifyPanNo)
customerCheckRouter.post("/checkSignUp", upload.single("image"), checkSignUp);
customerCheckRouter.post("/checkMarkAttendence", upload.single("image"), checkMarkAttendence)

export default customerCheckRouter;