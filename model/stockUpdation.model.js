import mongoose from "mongoose";

const StockUpdationSchema = new mongoose.Schema({
    created_by: {
        type: String
    },
    database: {
        type: String
    },
    warehouseToId: {
        type: String
    },
    warehouseFromId: {
        type: String
    },
    stockTransferDate: {
        type: String
    },
    exportId: {
        type: String
    },
    productItems: [{
        productId: {
            type: String
        },
        unitType: {
            type: String
        },
        primaryUnit: {
            type: String
        },
        secondaryUnit: {
            type: String
        },
        secondarySize: {
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
        sgstRate: {
            type: Number
        },
        cgstRate: {
            type: Number
        },
        isgtRate: {
            type: Number
        },
        taxableAmount: {
            type: Number
        },
        grandTotal: {
            type: Number
        },
        gstPercentage: {
            type: String
        },
        igstTaxType: {
            type: Boolean
        },
        pendingStock: {
            type: Number,
            default: 0
        },
        damageItem: {
            type: Object
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
    },
    warehouseNo: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })
export const StockUpdation = mongoose.model("stockUpdation", StockUpdationSchema)