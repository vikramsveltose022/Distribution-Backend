import mongoose from "mongoose";

const BankSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    database: {
        type: String
    },
    bankName: {
        type: String
    },
    bankIFSC: {
        type: String
    },
    accountNumber: {
        type: Number
    },
    branchName: {
        type: String
    },
    upiId: {
        type: String
    },
    openingBalance: {
        type: Number
    },
    gpay_PhonepayNumber: {
        type: Number
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const BankDetail = mongoose.model("BankDetail", BankSchema)