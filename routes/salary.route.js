import express from "express";
import { deleteSalary, saveSalary, updatedSalary, viewSalary, viewSalaryById } from "../controller/salary.controller.js";

const router = express.Router();

router.post("/save-salary", saveSalary)
router.get("/view-salary/:database", viewSalary)
router.get("/view-salary-by-id/:id", viewSalaryById)
router.delete("/delete-salary/:id", deleteSalary)
router.put("/update-salary/:id", updatedSalary)

export default router;