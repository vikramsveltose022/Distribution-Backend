import mongoose from "mongoose";

const leaveHRMSchema = new mongoose.Schema({
    database: {
        type: String
    },
    leaveType: {
        type: String
    },
    noOfYearly: {
        type: Number
    },
    noOfmonthly: {
        type: Number
    },
    checkStatus: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const LeaveHRM = mongoose.model("leaveHRM", leaveHRMSchema)