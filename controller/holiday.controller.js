import { Holiday } from "../model/holiday.model.js";
import { WorkingHours } from "../model/workingHours.model.js";

export const SaveHoliday = async (req, res, next) => {
    try {
        const holiday = await Holiday.create(req.body)
        return holiday ? res.status(200).json({ message: "data saved success", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewHoliday = async (req, res, next) => {
    try {
        const holiday = await Holiday.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (holiday.length > 0) ? res.status(200).json({ Holiday: holiday, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewHolidayById = async (req, res, next) => {
    try {
        const holiday = await Holiday.findById(req.params.id)
        return holiday ? res.status(200).json({ Holiday: holiday, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteHoliday = async (req, res, next) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id)
        if (!holiday) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedHoliday = async (req, res, next) => {
    try {
        const holiday = await Holiday.findById(req.params.id)
        if (!holiday) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Holiday.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const saveWorkingHours = async (req, res, next) => {
    try {
        const check = await WorkingHours.findOne({ id: req.body.id, shiftName: req.body.shiftName, database: req.body.database })
        if (check) {
            return res.status(404).json({ message: "shift id already exist", status: false })
        }
        const time = await WorkingHours.create(req.body)
        return time ? res.status(200).json({ message: "saved successfully", time, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteWorkingHours = async (req, res, next) => {
    try {
        const check = await WorkingHours.findByIdAndDelete(req.params.id)
        if (!check) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ message: "delete successfull", status: true })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedWorkingHours = async (req, res, next) => {
    try {
        const check = await WorkingHours.findById(req.params.id)
        if (!check) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await WorkingHours.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

// export const saveWorkingHours = async (req, res, next) => {
//     try {
//         const check = await WorkingHours.findOne({ database: req.body.database })
//         if (!check) {
//             // if (typeof req.body.fromTime === 'number' && typeof req.body.toTime === 'number') {
//             //     req.body.totalHours = req.body.toTime - req.body.fromTime;
//             // } else {
//             //     req.body.fromTime = parseInt(req.body.fromTime)
//             //     req.body.toTime = parseInt(req.body.toTime)
//             //     req.body.totalHours = req.body.toTime - req.body.fromTime;
//             // }
//             const time = await WorkingHours.create(req.body)
//             return time ? res.status(200).json({ message: "saved successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
//         } else {
//             const id = check._id
//             // if (typeof req.body.fromTime === 'number' && typeof req.body.toTime === 'number') {
//             //     req.body.totalHours = req.body.toTime - req.body.fromTime;
//             // } else {
//             //     req.body.fromTime = parseInt(req.body.fromTime)
//             //     req.body.toTime = parseInt(req.body.toTime)
//             //     req.body.totalHours = req.body.toTime - req.body.fromTime;
//             // }
//             const details = req.body;
//             const updateDetails = await WorkingHours.findByIdAndUpdate(id, details, { new: true });
//             return updateDetails ? res.status(200).json({ message: "Data Updated Successfully", status: true }) : res.status(400).json({ message: "Something Went Wrong" });
//         }
//     }
//     catch (err) {
//         console.log(err);
//         return res.status(500).json({ error: "Internal Server Error", status: false })
//     }
// }

export const viewWorkingHours = async (req, res, next) => {
    try {
        const hours = await WorkingHours.find({ database: req.params.database })
        return (hours) ? res.status(200).json({ WorkingHours: hours, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewOneWorkingHours = async (req, res, next) => {
    try {
        const hours = await WorkingHours.findOne({ id: req.params.id })
        return (hours) ? res.status(200).json({ WorkingHours: hours, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}