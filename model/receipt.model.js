import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema({
    partyId1: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    type: {
        type: String
    },
    voucherType: {
        type: String
    },
    voucherNo: {
        type: Number
    },
    date: {
        type: Date
    },
    paymentMode: {
        type: String
    },
    paymentType: {
        type: String
    },
    title: {
        type: String
    },
    partyId: {
        type: String,
    },
    amount: {
        type: Number
    },
    instrumentNo: {
        type: String
    },
    note: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    runningAmount: {
        type: Number
    },
    cashRunningAmount: {
        type: Number
    }
}, { timestamps: true })

export const Receipt = mongoose.model("receipt", ReceiptSchema);