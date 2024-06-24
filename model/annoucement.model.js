import mongoose from "mongoose";

const AnnoucementSchema = new mongoose.Schema({
    database: {
        type: String
    },
    annoucementTitle: {
        type: String
    },
    branch: {
        type: String
    },
    department: {
        type: String
    },
    employeeName: {
        type: []
    },
    annoucementStartDate: {
        type: String
    },
    annoucementEndDate: {
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

export const Annoucement = mongoose.model("annoucement", AnnoucementSchema)