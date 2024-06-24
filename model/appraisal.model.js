import mongoose from "mongoose";

const AppraisalSchema = new mongoose.Schema({
    database: {
        type: String
    },
    userId: {
        type: String
    },
    empName: {
        type: String
    },
    rule: {
        type: String
    },
    panCard: {
        type: String
    },
    applyMonth: {
        type: String
    },
    incrementValue: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Appraisal = mongoose.model("Appraisal", AppraisalSchema)