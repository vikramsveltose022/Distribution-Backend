import mongoose from "mongoose";

const DebitNoteSchema = new mongoose.Schema({
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
    debitType: {
        type: String,
        default: "D"
    },
    reverseCharge: {
        type: String,
        default: "N"
    }
}, { timestamps: true });

export const DebitNote = mongoose.model("debitNote", DebitNoteSchema)