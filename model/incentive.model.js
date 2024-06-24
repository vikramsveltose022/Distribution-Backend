import mongoose from "mongoose";

const IncentiveSchema = new mongoose.Schema({
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
    title: {
        type: String
    },
    pancardNo: {
        type: String
    },
    targetAchievement: {
        type: Number
    },
    targetAssign: {
        type: Number
    },
    incentiveFund: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Incentive = mongoose.model("Incentive", IncentiveSchema)