import express from "express";
import { CreateSuperAdminRole, allSalesPerson, allSuperAdmin, createSuperAdmin, getRole } from "../controller/master.controller.js";

const router = express.Router();

router.get("/all-super-admin-list", allSuperAdmin)
router.post("/create-super-admin", createSuperAdmin)
router.post("/create-super-admin-role", CreateSuperAdminRole)
router.get("/get-super-admin-role/:id", getRole)

router.get("/get-all-sales", allSalesPerson)

export default router;