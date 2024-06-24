import mongoose from "mongoose";

const SubcriptionSchema = new mongoose.Schema({
    database: {
        type: String
    },
    userId: {
        type: String
    },
    subscriptionCost: {
        type: Number
    },
    days: {
        type: String
    },
    planName: {
        type: String
    },
    noOfUser: {
        type: Number
    },
    subscriptionType: {
        type: String
    },
    annualMaintenanceCost: {
        type: Number
    },
    perUserCost: {
        type: Number
    },
    planStart: {
        type: String
    },
    planEnd: {
        type: String
    },
    userRegister: {
        type: Number
    },
    userAllotted: {
        type: Number
    },
    billAmount: {
        type: String
    },
    planStatus: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("subscriptionUser", SubcriptionSchema)