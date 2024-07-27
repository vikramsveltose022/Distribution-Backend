import { LeaveHRM } from "../model/leaveHRM.model.js";

export const saveLeave = async (req, res, next) => {
    try {
        const leave = await LeaveHRM.create(req.body)
        return leave ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewLeave = async (req, res, next) => {
    try {
        const leave = await LeaveHRM.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (leave.length > 0) ? res.status(200).json({ Leave: leave, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewLeaveById = async (req, res, next) => {
    try {
        const leave = await LeaveHRM.findById(req.params.id)
        return leave ? res.status(200).json({ Leave: leave, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteLeave = async (req, res, next) => {
    try {
        const leave = await LeaveHRM.findById(req.params.id)
        if (!leave) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        leave.status = "Deactive"
        await leave.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedLeave = async (req, res, next) => {
    try {
        const leave = await LeaveHRM.findById(req.params.id)
        if (!leave) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await LeaveHRM.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}