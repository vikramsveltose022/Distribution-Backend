import mongoose from "mongoose";

const LeaveManageSchema = new mongoose.Schema({
    database: {
        type: String
    },
    employee: {
        type: String
    },
    leaveType: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    leaveReason: {
        type: String
    },
    checkStatus: {
        type: String
    },
    totalDays: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const LeaveManage = mongoose.model("leaveManage", LeaveManageSchema)