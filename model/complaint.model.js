import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
    database: {
        type: String
    },
    complaintFromEmployeeName: {
        type: String
    },
    complaintToEmployeeName: {
        type: String
    },
    complaintDate: {
        type: String
    },
    title: {
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

export const Complaint = mongoose.model("complaint", ComplaintSchema)