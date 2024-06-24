import { Attendence } from "../model/attendence.model.js";
import { User } from "../model/user.model.js";
import { EmployeeVerify } from "../model/verify.employee.model.js";

export const saveAttendence = async (req, res, next) => {
    try {
        const face = await Attendence.create(req.body)
        return face ? res.status(200).json({ message: "successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAttendence = async (req, res) => {
    try {
        const attendence = await Attendence.find({}).sort({ sortorder: -1 })
        if (attendence.length > 0) {
            return res.status(200).json({ attendence, status: true });
        } else {
            return res.status(404).json({ status: false, message: 'not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
}

export const saveImage = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.filename;
        }
        const pan = await User.findOne({ Pan_No: req.body.panNo })
        if (!pan) {
            return res.status(200).json({ message: "pan no. not found", status: false })
        }
        req.body.userId = pan._id;
        const verifyEmployee = await EmployeeVerify.create(req.body)
        return verifyEmployee ? res.status(200).json({ message: "data saved successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewEmployee = async (req, res) => {
    try {
        const employee = await EmployeeVerify.find({}).sort({ sortorder: -1 })
        if (employee.length > 0) {
            return res.status(200).json({ employee, status: true });
        } else {
            return res.status(404).json({ status: false, message: 'not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
}