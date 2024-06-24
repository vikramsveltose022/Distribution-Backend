import express from "express";
import multer from "multer";
import { DeleteUnit, SaveUnit, UnitXml, UpdateUnit, ViewUnit, ViewUnitById } from "../controller/unit.controller.js";

const router = express.Router();
const upload = multer({ dest: "public/Images/" });

router.get("/get-xml", UnitXml);

router.post("/save-unit", SaveUnit);
router.get("/view-unit/:id/:database", ViewUnit);
router.get("/view-unit-by-id/:id", ViewUnitById)
router.delete("/delete-unit/:id", DeleteUnit)
router.put("/update-unit/:id", UpdateUnit)

export default router;