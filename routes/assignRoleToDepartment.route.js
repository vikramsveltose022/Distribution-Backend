import express from "express";
import { ViewAssignRoleById, saveAssignRole, updateAssignRole, viewAssignRole } from "../controller/assignRoleToDepartment.controller.js";

const router = express.Router();

router.post("/save-assign-role", saveAssignRole);
router.get("/view-assign-role/:database", viewAssignRole)
router.get("/vieww-assign-role/:id/:database", viewAssignRole)
router.put("/update-assign-role/:id", updateAssignRole)
router.get("/view-assign-role-by-id/:id", ViewAssignRoleById)
export default router;