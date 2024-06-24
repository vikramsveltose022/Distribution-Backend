import mongoose from "mongoose";

const SubcriptionSchema = new mongoose.Schema({
    subscriptionCost: {
        type: Number
    },
    days: {
        type: Number
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
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("subscription", SubcriptionSchema)