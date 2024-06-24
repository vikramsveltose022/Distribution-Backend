import mongoose from "mongoose";

const OverDueSchema = new mongoose.Schema({
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
    activeStatus: {
        type: String,
        default: "Active"
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

export const OverDueReport = mongoose.model("OverDueReport", OverDueSchema)