import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
    database: {
        type: String
    },
    employeeName: {
        type: String
    },
    rule: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: Number
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Salary = mongoose.model("salary", SalarySchema)