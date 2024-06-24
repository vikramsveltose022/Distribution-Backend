import express from "express";
import { DeleteBranch, SaveBranch, UpdateBranch, ViewBranch, ViewByIdBranch } from "../controller/userBranch.controller.js";

const router = express.Router();

router.post("/save-branch", SaveBranch);
router.get("/view-branch/:database", ViewBranch);
router.get("/view-branch-by-id/:id", ViewByIdBranch)
router.delete("/delete-branch/:id", DeleteBranch)
router.put("/update-branch/:id", UpdateBranch)

export default router;