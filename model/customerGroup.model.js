import mongoose from "mongoose";

const CustomerGroupSchema = new mongoose.Schema({
    id: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    groupName: {
        type: String
    },
    grade: {
        type: String
    },
    discount: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const CustomerGroup = mongoose.model("customerGroup", CustomerGroupSchema)