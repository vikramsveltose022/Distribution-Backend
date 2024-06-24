import axios from "axios";
import { Party } from "../model/partyCreation.model.js";

export const PartyXml = async (req, res) => {
    const fileUrl = "https://xmlfiles.nyc3.digitaloceanspaces.com/PartyCreation.xml";
    try {
        const response = await axios.get(fileUrl);
        const data = response.data;
        return res.status(200).json({ data, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error reading the file");
    }
};

export const SaveParty = async (req, res, next) => {
    try {
        const party = await Party.create(req.body)
        return party ? res.status(200).json({ message: "Data Save Successfully", Party: party, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewParty = async (req, res, next) => {
    try {
        let party = await Party.find().sort({ sortorder: -1 })
        return party ? res.status(200).json({ Party: party, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const ViewPartyById = async (req, res, next) => {
    try {
        let party = await Party.findById({ _id: req.params.id }).sort({ sortorder: -1 })
        return party ? res.status(200).json({ Party: party, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteParty = async (req, res, next) => {
    try {
        const party = await Party.findByIdAndDelete({ _id: req.params.id })
        return (party) ? res.status(200).json({ message: "delete successful", status: true }) : res.status(404).json({ error: "Not Found", status: false });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const UpdateParty = async (req, res, next) => {
    try {
        const partyId = req.params.id;
        const existingParty = await Party.findById(partyId);
        if (!existingParty) {
            return res.status(404).json({ error: 'party not found', status: false });
        }
        else {
            const updatedParty = req.body;
            await Party.findByIdAndUpdate(partyId, updatedParty, { new: true });
            return res.status(200).json({ message: 'Party Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};