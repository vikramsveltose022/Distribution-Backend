import express from "express";
import { DeleteCreateAccount, SaveCreateAccount, UpdatedCreateAccount, ViewCreateAccount, ViewCreateAccountById } from "../controller/createAccount.controller.js";

const router = express.Router();

router.post("/save-expenses", SaveCreateAccount)
router.get("/view-expenses/:database", ViewCreateAccount)
router.get("/view-expenses-by-id/:id", ViewCreateAccountById)
router.delete("/delete-expenses/:id", DeleteCreateAccount)
router.put("/update-expenses/:id", UpdatedCreateAccount)

export default router;