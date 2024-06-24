import mongoose from "mongoose";

const ResignationSchema = new mongoose.Schema({
    database: {
        type: String
    },
    employeeName: {
        type: String
    },
    resignationDate: {
        type: String
    },
    lastWorkingDay: {
        type: String
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Resignation = mongoose.model("resignation", ResignationSchema)