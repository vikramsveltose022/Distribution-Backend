import express from "express";
import { DeleteCustomerGroup, ViewCustomerGroup, ViewCustomerGroupById, saveCustomerGroup, updatedCustomerGroup } from "../controller/customerGroup.controller.js";

const router = express.Router();

router.post("/save-customer-group", saveCustomerGroup);
router.get("/view-customer-group/:database", ViewCustomerGroup);
router.get("/view-customer-group-by-id/:id", ViewCustomerGroupById);
router.delete("/delete-customer-group/:id", DeleteCustomerGroup);
router.put("/update-customer-group/:id", updatedCustomerGroup)

export default router;