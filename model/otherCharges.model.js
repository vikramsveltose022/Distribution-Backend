import mongoose from "mongoose";

const OtherChargesSchema = new mongoose.Schema({
    created_by: {
        type: String
    },
    database: {
        type: String
    },
    title: {
        type: String
    },
    amount: {
        type: Number
    },
    percentage: {
        type: Number
    },
    value: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    type: {
        type: String
    }
}, { timestamps: true })

export const OtherCharges = mongoose.model("otherCharges", OtherChargesSchema)