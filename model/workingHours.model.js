import mongoose from "mongoose";

const WorkingHoursSchema = new mongoose.Schema({
    id: {
        type: String
    },
    database: {
        type: String
    },
    fromTime: {
        type: String
    },
    toTime: {
        type: String
    },
    totalHours: {
        type: Number
    },
    min: {
        type: Number
    },
    lateByTime: {
        type: String
    },
    shortByTime: {
        type: String
    },
    shiftName: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const WorkingHours = mongoose.model("WorkingHour", WorkingHoursSchema)