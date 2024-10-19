import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
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
    status: {
        type: String
    }
}, { timestamps: true })

export const Activity = mongoose.model("activity", ActivitySchema)