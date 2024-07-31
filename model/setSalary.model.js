import mongoose from "mongoose";

const SetSalarySchema = new mongoose.Schema({
    database: {
        type: String
    },
    employeeName: {
        type: String
    },
    userId: {
        type: String
    },
    salaryMonth: {
        type: String
    },
    panCard: {
        type: String
    },
    basicSalary: {
        type: Number
    },
    totalSalary: {
        type: Number
    },
    pfAmount: {
        type: Number
    },
    totalWorkingDays: {
        type: Number
    },
    totalHours: {
        type: Number
    },
    overTimeAmount: {
        type: Number
    },
    bonusAmount: {
        type: Number
    },
    paidStatus: {
        type: String,
        default: "unpaid"
    },
    employee: [],
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const SetSalary = mongoose.model("SetSalary", SetSalarySchema)