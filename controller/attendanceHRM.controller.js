import { HRMAttendance } from "../model/attendanceHRM.model.js";

export const saveAttendance = async (req, res, next) => {
    try {
        const attendance = await HRMAttendance.create(req.body)
        return attendance ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAttendance = async (req, res, next) => {
    try {
        const attendance = await HRMAttendance.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (attendance.length > 0) ? res.status(200).json({ Attendance: attendance, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAttendanceById = async (req, res, next) => {
    try {
        const attendance = await HRMAttendance.findById(req.params.id)
        return attendance ? res.status(200).json({ Attendance: attendance, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteAttendance = async (req, res, next) => {
    try {
        const attendance = await HRMAttendance.findById(req.params.id)
        if (!attendance) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        attendance.status = "Deactive"
        await attendance.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedAttendance = async (req, res, next) => {
    try {
        const attendance = await HRMAttendance.findById(req.params.id)
        if (!attendance) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await HRMAttendance.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}