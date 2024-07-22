import axios from "axios";
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

// aws api intregation...............................
export const UserRegister = async (req, res, next) => {
    try {
        const response = await axios.post("http://13.201.119.216:8050/api/register", req.body)
        if (response.status === 200) {
            return res.status(200).json({ User: response.data, message: "data saved successfull!", status: true })
        }
        return res.status(400).json({ message: "Bad Request", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UserRecognition = async (req, res, next) => {
    try {
        const response = await axios.post("http://13.201.119.216:8050/api/recognize", req.body);
        if (response.data.status) {
            return res.status(200).json({ User: response.data, message: response.data.message, status: true });
        } else {
            return res.status(400).json({ message: response.data.message, status: false });
        }
    } catch (err) {
        console.error("Error in UserRecognition:", err);
        return res.status(500).json({ error: "Internal Server Error", status: false, successCode: err.response.status });
    }
};
export const Attendance = async (req, res, next) => {
    try {
        const attend = await axios.get(`http://13.201.119.216:8050/api/attendanceAws/${req.params.database}`)
        if (attend.data.status) {
            return res.status(200).json({ Attendance: attend.data.Attendance, status: true })
        }
        return res.status(200).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const CreateCollection = async (req, res, next) => {
    try {
        const response = await axios.post("http://13.201.119.216:8050/api/createcollection", req.body)
        if (response.status === 200) {
            return res.status(200).json({ message: response.data.message, status: true })
        }
        return res.status(400).json({ message: response.data, status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false, successCode: err.response.status })
    }
}
export const AttendanceListById = async (req, res, next) => {
    try {
        const attend = await axios.get(`http://13.201.119.216:8050/api/attendanceAwsById/${req.params.id}`)
        if (attend.data.status) {
            return res.status(200).json({ Attendance: attend.data.Attendance, status: true })
        }
        return res.status(200).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const AttendanceList = async (req, res, next) => {
    try {
        const attend = await axios.get(`http://13.201.119.216:8050/api/localDataAttendance/${req.params.database}`)
        if (attend.data.status) {
            return res.status(200).json({ Attendance: attend.data.Attendance, status: true })
        }
        return res.status(200).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
