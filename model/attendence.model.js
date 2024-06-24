import mongoose from "mongoose";

const FaceSchema = new mongoose.Schema({
    database: {
        type: String
    },
    inTime: {
        type: String
    },
    outTime: {
        type: String
    },
    date: {
        type: String
    },
    status: {
        type: String
    }
}, { timestamps: true })

export const Attendence = mongoose.model("attendence", FaceSchema)