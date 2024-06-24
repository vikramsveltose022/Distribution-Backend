import mongoose from "mongoose";

const FaceSchema = new mongoose.Schema({
    database: {
        type: String
    },
    userId: {
        type: String
    },
    userName: {
        type: String
    },
    type: {
        type: String
    },
    months: {
        type: Number
    },
    years: {
        type: Number
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Bonus = mongoose.model("bonus", FaceSchema)