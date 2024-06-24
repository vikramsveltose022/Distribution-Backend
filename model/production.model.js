import mongoose from "mongoose";

const productionProcessSchema = mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    product_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    },
    productItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        unitType: {
            type: String
        },
        qty: {
            type: Number
        },
        price: {
            type: Number
        },
        totalPrice: {
            type: Number
        }
    }],
    miscellaneousExpennses: {
        type: Number
    },
    gstApplied: {
        type: Number
    },
    otherCharges: {
        type: Number
    },
    discount: {
        type: Number
    },
    grandTotal: {
        type: Number
    },
    wastageItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        unitType: {
            type: String
        },
        qty: {
            type: Number
        },
        price: {
            type: Number
        },
        totalPrice: {
            type: Number
        }
    }],
    returnItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        unitType: {
            type: String
        },
        qty: {
            type: Number
        },
        price: {
            type: Number
        },
        totalPrice: {
            type: Number
        }
    }],
    returnAmount: {
        type: Number
    }
}, { timestamps: true });

export const Production = mongoose.model("production", productionProcessSchema);
