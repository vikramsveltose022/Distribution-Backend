import { Complaint } from "../model/complaint.model.js";

export const saveComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.create(req.body)
        return complaint ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.find({ status: "Active", database: req.params.database }).populate({ path: "complaintFromEmployeeName", model: "user" })
            .populate({ path: "complaintToEmployeeName", model: "user" }).sort({ sortorder: -1 })
        return (complaint.length > 0) ? res.status(200).json({ Complaint: complaint, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewComplaintById = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate({ path: "complaintFromEmployeeName", model: "user" })
            .populate({ path: "complaintToEmployeeName", model: "user" })
        return complaint ? res.status(200).json({ Complaint: complaint, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return res.status(404).json({ message: "Complaint Not Found", status: false })
        }
        complaint.status = "Deactive"
        await complaint.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return res.status(404).json({ message: "Complaint Not Found", status: false })
        }
        const updatedData = req.body;
        await Complaint.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}