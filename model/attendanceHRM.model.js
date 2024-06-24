import mongoose from "mongoose";

const HRMSchema = new mongoose.Schema({
    database: {
        type: String
    },
    employee: {
        type: String
    },
    date: {
        type: String
    },
    hours: {
        type: String
    },
    remark: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const HRMAttendance = mongoose.model("hrmAttendance", HRMSchema)