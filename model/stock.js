import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    database: {
        type: String
    },
    warehouseId: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    Closingdate: {
        type: String,
    },
    Openingdate: {
        type: String,
    },
    mobileNumber: {
        type: String
    },
    email: {
        type: String
    },
    Country: {
        type: String
    },
    State: {
        type: String
    },
    City: {
        type: String
    },
    closingStatus: {
        type: String,
    },
    openingStatus: {
        type: String
    },
    productItems: [{
        productId: {
            type: String
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
        pendingStock: {
            type: Number
        },
        gstPercentage: {
            type: String
        },
        igstTaxType: {
            type: Boolean
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
        },
        cQty: {
            type: Number,
            default: 0
        },
        cBAmount: {
            type: Number
        },
        cTaxAmount: {
            type: Number,
            default: 0
        },
        cTotal: {
            type: Number,
            default: 0
        },
        primaryUnit: {
            type: String
        },
        secondaryUnit: {
            type: String
        },
        secondarySize: {
            type: Number
        }
    }],
    damageItem: []
}, { timestamps: true })
export const Stock = mongoose.model("stock", stockSchema)