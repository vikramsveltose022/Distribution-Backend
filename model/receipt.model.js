import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema({
    created_by: {
        type: String
    },
    database: {
        type: String
    },
    userId: {
        type: String
    },
    partyId: {
        type: String,
    },
    expenseId: {
        type: String,
    },
    transporterId: {
        type: String,
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
    amount: {
        type: Number
    },
    instrumentNo: {
        type: String
    },
    remark: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    time: {
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