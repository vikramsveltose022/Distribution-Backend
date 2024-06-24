import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema({
    database: {
        type: String
    },
    inTime: {
        type: String
    },
    outTime: {
        type: String
    },
    year: {
        type: String
    },
    month: {
        type: String
    },
    day: {
        type: String
    },
    holidayName: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Holiday = mongoose.model("holiday", HolidaySchema)