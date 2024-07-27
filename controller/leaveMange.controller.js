import { LeaveManage } from "../model/leaveMange.model.js";

export const SaveData = async (req, res, next) => {
    try {
        const manage = await LeaveManage.create(req.body)
        return manage ? res.status(200).json({ message: "data saved success", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewData = async (req, res, next) => {
    try {
        const leaveManage = await LeaveManage.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "employee", model: "user" }).populate({ path: "leaveType", model: "leaveHRM" })
        return (leaveManage.length > 0) ? res.status(200).json({ Manage: leaveManage, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewLeaveById = async (req, res, next) => {
    try {
        const manage = await LeaveManage.findById(req.params.id)
        return manage ? res.status(200).json({ Manage: manage, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteLeave = async (req, res, next) => {
    try {
        const manage = await LeaveManage.findByIdAndDelete(req.params.id)
        if (!manage) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedLeaveMange = async (req, res, next) => {
    try {
        const manage = await LeaveManage.findById(req.params.id)
        if (!manage) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await LeaveManage.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}