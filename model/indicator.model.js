import mongoose from "mongoose";

const IndicatorSchema = new mongoose.Schema({
    database: {
        type: String
    },
    userId: {
        type: String
    },
    employeeName: {
        type: String
    },
    rule: {
        type: String
    },
    attendance: {
        type: Number
    },
    targetRating: {
        type: Number
    },
    collectionRating: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Indicator = mongoose.model("indicator", IndicatorSchema)