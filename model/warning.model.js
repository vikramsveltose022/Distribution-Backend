import mongoose from "mongoose";

const WarningSchema = new mongoose.Schema({
    database: {
        type: String
    },
    warningByEmployeeName: {
        type: String
    },
    warningToEmployeeName: {
        type: String
    },
    subject: {
        type: String
    },
    warningDate: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Warning = mongoose.model("warning", WarningSchema)