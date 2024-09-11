import mongoose from "mongoose"

const LedgerSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String
    },
    partyId: {
        type: String
    },
    expenseId: {
        type: String
    },
    transporterId: {
        type: String
    },
    orderId: {
        type: String
    },
    name: {
        type: String
    },
    voucherType: {
        type: String
    },
    voucherNo: {
        type: Number
    },
    debit: {
        type: Number
    },
    credit: {
        type: Number
    },
    balance: {
        type: Number
    },
    reason: {
        type: String
    },
    debitBalance: {
        type: Number
    },
    creditBalance: {
        type: Number
    },
    closingBalance: {
        type: Number
    },
    dummyDebitBalance: {
        type: Number
    },
    dummyCreditBalance: {
        type: Number
    },
    ledgerType: {
        type: String
    },
    particular: {
        type: String
    },

    paymentMode: {
        type: String
    }
}, { timestamps: true })

export const Ledger = mongoose.model("ledger", LedgerSchema)