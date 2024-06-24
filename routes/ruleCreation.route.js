import express from "express"
import { Salary, ViewSalary, deleteRule, saveRule, setSalary, updatedRule, viewRule, viewRuleById, workingHours } from "../controller/ruleCreation.controller.js";

const router = express.Router()

router.post("/save-rules", saveRule)
router.get("/view-rules/:database", viewRule)
router.get("/view-rules-by-id/:id", viewRuleById)
router.delete("/delete-rules/:id", deleteRule)
router.put("/update-rules/:id", updatedRule)

router.get("/salary", setSalary)
router.get("/set/:database", Salary)
router.get("/view-salary/:database", ViewSalary)
router.get("/working-hours/:database/:panNo", workingHours)
export default router;