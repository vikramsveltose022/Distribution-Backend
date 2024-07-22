import { Attendence } from "../model/attendence.model.js";
import axios from "axios";
import { Customer } from "../model/customer.model.js";
import { User } from "../model/user.model.js";
import Jwt from "jsonwebtoken";

export const checkSignIn = async (req, res, next) => {
    try {
        const { email, password, latitude, longitude, currentAddress } = req.body;
        let existingAccount = await User.findOne({ email }).populate({
            path: "rolename",
            model: "role",
        }).maxTimeMS(30000);
        let existingCustomer = await Customer.findOne({ email }).populate({ path: "rolename", model: "role" })
        if (!existingAccount && !existingCustomer) {
            return res.status(400).json({ message: "Incorrect email", status: false });
        }
        if (existingAccount && existingAccount.password !== password ||
            existingCustomer && existingCustomer.password !== password) {
            return res.status(400).json({ message: "Incorrect password", status: false });
        }
        const token = Jwt.sign({ subject: email }, process.env.TOKEN_SECRET_KEY);
        if (existingAccount) {
            await User.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
            return res.json({ message: "Login successful", user: { ...existingAccount.toObject(), password: undefined, token }, status: true, });
        }
        if (existingCustomer) {
            await Customer.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
            return res.json({ message: "Login successful", user: { ...existingCustomer.toObject(), password: undefined, token }, status: true, });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const checkVerifyPanNo = async (req, res) => {
    try {
        const { Pan_No, database } = req.body;
        if (!Pan_No) {
            return res.status(400).json({ status: false, message: 'Field required.' });
        }
        // const existingFace = await User.findOne({ Pan_No: panNo});
        // const existingFace = await User.findOne({ $or: [{ Pan_No: Pan_No, database: database }, { Aadhar_No: Pan_No, database: database }] });
        const existingFace = await User.findOne({ $or: [{ Pan_No, database }, { Aadhar_No: Pan_No, database }] }).maxTimeMS(30000);
        if (existingFace) {
            return res.status(200).json({ status: true, message: 'Verification Successfully.', User: existingFace });
        } else {
            return res.status(404).json({ status: false, message: 'Data not found. Verification unsuccessful.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
}
export const checkSignUp = async (req, res) => {
    const { name, Pan_No, database, latitude, longitude, basicSalary, uuid, url, image } = req.body;
    if (!name) {
        return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide name" });
    }
    if (!Pan_No) {
        return res.status(401).send({ status: false, msg: "BAD REQUEST, please provide mobile" });
    }
    const registeredUser = await User.findOne({ Pan_No: Pan_No }).maxTimeMS(30000);
    if (registeredUser) {
        return res.status(404).send({
            status: false,
            message: `user with this number is already registered`,
        });
    }
    if (!req.file) {
        return res
            .status(405)
            .send({ status: false, msg: "BAD REQUEST, please provide image" });
    } else {
        req.body.image = req.file.filename
    }

    const newUser = new User({
        name,
        database,
        Pan_No,
        image,
        // descriptions: descriptions,
        latitude,
        longitude,
        basicSalary,
        uuid,
        url
    });
    await newUser.save();

    res.status(201).send("User registered successfully!");
};
const attendance = async (use, data) => {
    try {
        let lateTime = "";
        let earlyTime = ""
        const res = await axios.get(`https://customer-node.rupioo.com/holiday/view-working/${use.database}`)
        if (res.status) {
            let inTime = res.data.WorkingHours.fromTime;
            let time = data.time.toString();
            let [inHours, inMinutes] = inTime.split(':').map(Number);
            let [timeHours, timeMinutes] = time.split(/:| /).slice(0, 2).map(Number);
            if (!time.includes('am') && !time.includes('pm')) {
                timeHours += 12;
            }
            let delayMinutes = (timeHours * 60 + timeMinutes) - (inHours * 60 + inMinutes);
            let delayHours = Math.floor(delayMinutes / 60);
            delayMinutes %= 60;
            if (delayMinutes > 0 || delayHours > 0) {
                lateTime = delayHours + ":" + delayMinutes + " minute"
                // console.log("Delay:", delayHours, "hours", delayMinutes, "minutes");
            }
            // -------------------------------------------------------------------------------

            let outTime = res.data.WorkingHours.toTime;
            let timeOut = data.time.toString();
            let [inHours1, inMinutes1] = outTime.split(':').map(Number);
            if (inHours1 > 12) {
                inHours1 = inHours1 - 12
            }
            let [timeHours1, timeMinutes1] = timeOut.split(/:| /).slice(0, 2).map(Number);
            if (!timeOut.includes('am') && !timeOut.includes('pm')) {
                timeHours1 += 12;
            }
            let earlyMinutes = (timeHours1 * 60 + timeMinutes1) - (inHours1 * 60 + inMinutes1);
            let earlyHours = Math.floor(earlyMinutes / 60);
            earlyMinutes %= 60;
            if (earlyMinutes < 0 || earlyHours < 0) {
                earlyTime = earlyHours + ":" + earlyMinutes + " minute"
                // console.log("Delay:", earlyMinutes, "hours", earlyHours, "minutes");
            }
        }
        const Pan_No = use.Pan_No;
        const name = use.name;
        const database = use.database;
        const currentDate = data.date; // moment().format("YYYY-MM-DD"); // "2024-02-24"
        const currentTime = data.time; // moment().format("HH:mm:ss");
        const Url = data.url; // moment().format("HH:mm:ss");

        // const targetTime1 = "09:50:00 am";
        // const targetTime3 = "05:30:00 pm";
        // const currentTimeDate = new Date(`2024-01-01 ${currentTime}`);
        // const targetTimeDate1 = new Date(`2024-01-01 ${targetTime1}`);
        // const targetTimeDate3 = new Date(`2024-01-01 ${targetTime3}`);
        // const status1 = currentTimeDate > targetTimeDate1;
        // const status3 = currentTimeDate > targetTimeDate3;
        // console.log(status1);
        // console.log(status3);

        const attendanceEntry = await Attendence.findOne({
            Pan_No,
            date: currentDate,
        });
        // if (attendanceEntry) {
        //   // here write that code check time previous time if suppose 10:10pm previous time if under 10 minute come so not save this time
        // }
        if (!attendanceEntry) {
            const newAttendanceEntry = new Attendance({
                Pan_No,
                name,
                database,
                date: currentDate,
                inTimes: [currentTime],
                outTimes: [],
                late: lateTime
            });
            const first = await newAttendanceEntry.save();
            // console.log("fff " + first)
        } else {
            const lastDate = moment(attendanceEntry.date).format("YYYY-MM-DD");
            if (lastDate !== currentDate) {
                const newAttendanceEntry = new Attendance({
                    Pan_No,
                    name,
                    database,
                    date: currentDate,
                    inTimes: [currentTime],
                    outTimes: [],
                    late: lateTime
                });
                const second = await newAttendanceEntry.save();
                // console.log("sesese " + second)
            } else {
                if (
                    attendanceEntry.inTimes.length === attendanceEntry.outTimes.length
                ) {
                    attendanceEntry.inTimes.push(currentTime);
                } else {
                    attendanceEntry.early = earlyTime
                    attendanceEntry.outTimes.push(currentTime);
                }
                const thr = await attendanceEntry.save();
                // console.log("same " + thr)
            }
        }
    } catch (error) {
        console.error(error);
    }
};
export const checkMarkAttendence = async (req, res) => {
    try {
        const registeredUser = await User.findOne({ _id: req.body.id }).maxTimeMS(30000);
        await attendance(registeredUser, req.body);
        console.log("success");
        if (registeredUser) {
            if (req.file) {
                req.body.image = req.file.filename
            }
            const savedAttendence = await User.create(req.body);
            res.status(200).json({ savedAttendence, message: "Attendance Marked!" });
        }
    } catch (error) {
        console.error("Error during comparison:", error);
    }
};


