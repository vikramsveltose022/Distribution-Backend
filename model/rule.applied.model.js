import mongoose from "mongoose";

const RuleCreationSchema = new mongoose.Schema({
    database: {
        type: String
    },
    employeeName: {
        type: String
    },
    salary: {
        type: Number
    },
    userId: {
        type: String
    },
    employee: [{
        employeeName: {
            type: String
        },
        panNo: {
            type: String
        },
        salary: {
            type: Number
        },
        amount: {
            type: Number
        },
        option: {
            type: String
        },
        type: {
            type: String
        },
        typeValue: {
            type: Number
        },
        startDate: {
            type: Date,
            default: Date.now()
        },
        title: {
            type: String
        },
        rule: {
            type: String
        },
        period: {
            type: String
        }
    }],
    check: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const ApplyRule = mongoose.model("applyRule", RuleCreationSchema)