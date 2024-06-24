import mongoose from "mongoose";

const PartyLimitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    database: {
        type: String
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
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