import express from "express";
import { saveHierarchy, viewHierarchy, viewHierarchyById, } from "../controller/createHierarchy.controller.js";

const router = express.Router();

router.post("/save-hierarchy", saveHierarchy)
router.get("/view-hierarchy", viewHierarchy)
router.get("/view-hierarchy-by-id/:id", viewHierarchyById)

export default router;