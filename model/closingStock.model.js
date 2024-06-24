import mongoose from "mongoose";

const ClosingSchema = new mongoose.Schema({
    warehouseId: {
        type: String
    },
    warehouseId1: {
        type: String
    },
    productId: {
        type: String
    },
    cQty: {
        type: Number,
        default: 0
    },
    cBAmount: {
        type: Number,
        default: 0
    },
    cTaxAmount: {
        type: Number,
        default: 0
    },
    cTotal: {
        type: Number,
        default: 0
    },
    pQty: {
        type: Number,
        default: 0
    },
    pBAmount: {
        type: Number,
        default: 0
    },
    pTaxAmount: {
        type: Number,
        default: 0
    },
    pTotal: {
        type: Number,
        default: 0
    },
    sQty: {
        type: Number,
        default: 0
    },
    sBAmount: {
        type: Number,
        default: 0
    },
    sTaxAmount: {
        type: Number,
        default: 0
    },
    sTotal: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const ClosingStock = mongoose.model("ClosingStock", ClosingSchema)