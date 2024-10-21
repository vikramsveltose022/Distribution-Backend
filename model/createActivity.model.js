import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    database: {
        type: String
    },
    ActivityName: {
        type: String
    },
    Code: {
        type: String
    },
    FromDate: {
        type: Date
    },
    ToDate: {
        type: Date
    },
    NoOfDays: {
        type: String
    },
    status: {
        type: String
    }
}, { timestamps: true })

export const Activity = mongoose.model("activity", ActivitySchema)