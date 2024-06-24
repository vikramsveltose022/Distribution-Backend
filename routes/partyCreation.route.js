import express from "express";
import { DeleteParty, PartyXml, SaveParty, UpdateParty, ViewParty, ViewPartyById } from "../controller/partyCreation.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({dest:"public/Images/"})

router.get("/get-xml",PartyXml)
router.post("/save-party",SaveParty)
router.get("/view-party",ViewParty);
router.get("/view-party-by-id/:id",ViewPartyById)
router.delete("/delete-party/:id",DeleteParty);
router.put("/update-party/:id",UpdateParty);

export default router;