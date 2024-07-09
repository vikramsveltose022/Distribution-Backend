import express from "express";
import path from "path"
import { DeleteUser, DeleteUserDetail, EditProfile, GetExcelKeys, SaveUser, SaveUserDetail, SignIn, SignInWithAdmin, SuperAdminRoleUpdate, UpdateUser, UpdateUserDetail, UserList, ViewByIdUserDetail, ViewRegisterUser, ViewUser, ViewUserById, ViewUserDetail, ViewUserHRM, ViewWarehouse, assignUser, customId, deleteAssignUser, forgetPassword, otpVerify, saveUserWithExcel, updatePassword, updatePlan, updateUserWithExcel, verifyOTP, verifyPanNo, viewApplyRules, viewApplyRulesById } from "../controller/user.controller.js";
import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "public/Images" })
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

router.put("/update-plan/:id", updatePlan)
// router.post("/import-user-data", uploads.single('file'), saveUserWithExcel)
router.post("/import-user-data/:database", uploads.single('file'), saveUserWithExcel)
router.post("/update-import-user/:database", uploads.single('file'), updateUserWithExcel)

router.put("/update-super-admin-role/:id", SuperAdminRoleUpdate)
router.post("/save-user", upload.single("file"), SaveUser)
router.get("/view-register-user/:database", ViewRegisterUser)
router.get("/view-user/:id", ViewUserById);
router.get("/view-user-by-id/:id/:database", ViewUser)
router.get("/delete-user/:id", DeleteUser);
router.post("/update-user/:id", upload.single("file"), UpdateUser);

router.post("/signin", SignIn);
router.post("/verify-otp", verifyOTP)
router.post("/edit-profile/:id", upload.single("file"), EditProfile);

router.post("/forget-password", forgetPassword)
router.post("/otp-verify", otpVerify)
router.post("/update-password/:id", updatePassword)

router.get("/user-list/:database", UserList)
router.get("/view-warehouse/:id", ViewWarehouse);
router.post("/assign-user", assignUser)

router.post("/verify-pan-no", verifyPanNo)

router.post("/delete-assign-user", deleteAssignUser)

router.get("/model-key", GetExcelKeys)

router.get("/apply-rules/:id/:database", viewApplyRules)
router.get("/apply-rules-by-id/:id", viewApplyRulesById)
// router.get("/get", setSalary)

router.post("/save-user-detail", upload.any("files"), SaveUserDetail)
router.get("/view-user-detail/:database", ViewUserDetail)
router.get("/view-user-detail-by-id/:id", ViewByIdUserDetail)
router.delete("/delete-user-detail/:id", DeleteUserDetail)
router.put("/update-user-detail/:id", upload.any("files"), UpdateUserDetail)

router.post("/login-user", SignInWithAdmin);
router.get("/user-list-hrm/:database", ViewUserHRM)

router.post("/create-custom-id", customId)

export default router;