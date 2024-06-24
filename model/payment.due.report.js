import mongoose from "mongoose";

const PaymentDueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    database: {
        type: String
    },
    partyId1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    partyId: {
        type: String
    },
    orderId: {
        type: String
    },
    totalOrderAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    totalPaidAmount: {
        type: Number,
        default: 0
    },
    dueStatus: {
        type: String,
        default: "due"
    },
    lockingAmount: {
        type: Number,
        default: 0
    },
    lockStatus: {
        type: String,
    },
    voucherNo: {
        type: Number
    },
    voucherDate: {
        type: String
    },
    overDueDate: {
        type: Date
    },
    dueDays: {
        type: Number
    },
    overDueDays: {
        type: Number
    },
    salesPerson: {
        type: String
    }
}, { timestamps: true })

export const PaymentDueReport = mongoose.model("paymentDueReport", PaymentDueSchema)