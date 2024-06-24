import express from "express";
import { DeleteUser, DeleteUserDetail, EditProfile, GetExcelKeys, SaveUser, SaveUserDetail, SignIn, SignInWithAdmin, UpdateUser, UpdateUserDetail, UserList, ViewByIdUserDetail, ViewUser, ViewUserById, ViewUserDetail, ViewUserHRM, ViewWarehouse, assignUser, deleteAssignUser, forgetPassword, otpVerify, saveUserWithExcel, updatePassword, updatePlan, verifyOTP, verifyPanNo, viewApplyRules, viewApplyRulesById } from "../controller/user.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "public/Images" })
const uploads = multer({ dest: "public/ExcelFile/" })

router.put("/update-plan/:id", updatePlan)
router.post("/import-user-data", uploads.single('file'), saveUserWithExcel)

router.post("/save-user", upload.single("file"), SaveUser)
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

export default router;