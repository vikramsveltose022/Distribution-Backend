import mongoose from "mongoose";

const StockUpdationSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    database: {
        type: String
    },
    warehouseToId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "warehouse"
    },
    warehouseFromId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "warehouse"
    },
    stockTransferDate: {
        type: String
    },
    exportId: {
        type: String
    },
    productItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        unitType: {
            type: String
        },
        Size: {
            type: Number
        },
        currentStock: {
            type: Number
        },
        transferQty: {
            type: Number
        },
        price: {
            type: Number
        },
        totalPrice: {
            type: Number
        },
        demadge_percent: {
            type: String
        },
        reason: {
            type: String
        },
        igstTaxType: {
            type: Boolean
        }
    }],
    grandTotal: {
        type: Number
    },
    transferStatus: {
        type: String
    },
    InwardStatus: {
        type: String
    },
    OutwardStatus: {
        type: String
    }


}, { timestamps: true })
export const StockUpdation = mongoose.model("stockUpdation", StockUpdationSchema)