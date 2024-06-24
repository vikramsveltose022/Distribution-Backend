import express from "express";
import { DeleteDepartment, UpdateDepartment, saveDepartment, viewDepartment } from "../controller/department.controller.js";

const router = express.Router();

router.post("/save-department", saveDepartment);
router.get("/view-department/:database", viewDepartment)
router.put("/update-department/:id", UpdateDepartment)
router.delete("/delete-department/:id", DeleteDepartment)
export default router;