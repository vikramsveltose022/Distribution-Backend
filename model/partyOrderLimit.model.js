import mongoose from "mongoose";

const PartyLimitSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    database: {
        type: String
    },
    partyId: {
        type: String
    },
    orderId: {
        type: String
    },
    lockingAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    activeStatus: {
        type: String,
        default: "Active"
    },
}, { timestamps: true })

export const PartyOrderLimit = mongoose.model("PartyOrderLimit", PartyLimitSchema)