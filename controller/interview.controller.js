import { Interview } from "../model/interview.model.js";

export const saveInterview = async (req, res, next) => {
    try {
        const interview = await Interview.create(req.body)
        return interview ? res.status(200).json({ message: "Data Save Successfully", status: true }) : res.status(400).json({ message: "something went wrong", stauts: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewInterview = async (req, res, next) => {
    try {
        const interview = await Interview.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "candidateName", model: "jobApplied" })
        return (interview.length > 0) ? res.status(200).json({ Interview: interview, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewInterviewById = async (req, res, next) => {
    try {
        const interview = await Interview.findById({ _id: req.params.id }).populate({ path: "candidateName", model: "jobApplied" })
        return interview ? res.status(200).json({ Interview: interview, status: true }) : res.status(404).json({ message: "Not found" })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
        if (!interview) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        interview.status = await "Deactive"
        const deletedInterview = await interview.save();
        return (deletedInterview) ? res.status(200).json({ message: "delete successfully", status: false }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
        if (!interview) {
            return res.statut(404).json({ message: "Not found", status: false })
        }
        const updatedInterview = req.body;
        const updateInterview = await Interview.findByIdAndUpdate(req.params.id, updatedInterview, { new: true })
        return updateInterview ? res.status(200).json({ message: "Updated Successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}