import express from "express";
import { CreatRole, deleteRole, getRole, getRoleById, saveDashboardTabs, saveRole, saveTabs, updatedRole, updatedRoleGloble, viewDashboardTab, viewTab } from "../controller/role.controller.js";

const router = express.Router();

router.post("/create-role", CreatRole);
router.get("/get-role/:database", getRole);
router.get("/get-role-by-id/:id", getRoleById)
router.put("/update-role/:id", updatedRole)
router.post("/assign-role", saveRole)

router.post("/update-permission", updatedRoleGloble)

router.post("/save-tab", saveTabs);
router.get("/view-tab/:id", viewTab)
router.post("/save-dashboard-tab", saveDashboardTabs);
router.get("/view-dashboard-tab/:id", viewDashboardTab);

router.post("/deleted-roles", deleteRole)
export default router