import mongoose from "mongoose";

const RuleCreationSchema = new mongoose.Schema({
    database: {
        type: String
    },
    title: {
        type: String
    },
    rule: {
        type: String
    },
    type: {
        type: String
    },
    typeValue: {
        type: Number
    },
    period: {
        type: String
    },
    ruleType: {
        type: String
    },
    ruleTypeValue: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const ruleCreation = mongoose.model("rule", RuleCreationSchema)