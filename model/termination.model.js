import mongoose from "mongoose";

const TerminationSchema = new mongoose.Schema({
    database: {
        type: String
    },
    employeeName: {
        type: String
    },
    terminationType: {
        type: String
    },
    noticeDate: {
        type: String
    },
    terminationDate: {
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

export const Termination = mongoose.model("termination", TerminationSchema)