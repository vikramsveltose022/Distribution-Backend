import mongoose from "mongoose";

const CreditNoteSchema = new mongoose.Schema({
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
    orderId: {
        type: String
    },
    purchaseOrderId: {
        type: String
    },
    productItems: [],
    totalAmount: {
        type: Number
    },
    creditType: {
        type: String,
        default: "C"
    },
    noteNumber: {
        type: String
    },
    placeOfSupply: {
        type: String
    },
    rate: {
        type: Number
    },
    taxableValue: {
        type: Number
    },
    reverseCharge: {
        type: String,
        default: "N"
    }
}, { timestamps: true });

export const CreditNote = mongoose.model("creditNote", CreditNoteSchema)