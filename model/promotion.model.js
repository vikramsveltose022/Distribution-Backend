import mongoose from "mongoose";

const PromotionSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    activityId: {
        type: String
    },
    percentageWise: [{
        totalAmount: {
            type: Number
        },
        percentageDiscount: {
            type: Number
        },
        startDate: {
            type: String
        },
        endDate: {
            type: String
        },
        freeQty: {
            type: Number
        },
        status: {
            type: String,
            default: "Active"
        }
    }],
    amountWise: [{
        totalAmount: {
            type: Number
        },
        percentageAmount: {
            type: Number
        },
        startDate: {
            type: String
        },
        endDate: {
            type: String
        },
        freeQty: {
            type: Number
        },
        status: {
            type: String,
            default: "Active"
        }
    }],
    productWise: [{
        productId: {
            type: String
        },
        targetQty: {
            type: Number
        },
        discountAmount: {
            type: Number
        },
        discountPercentage: {
            type: Number
        },
        startDate: {
            type: String
        },
        endDate: {
            type: String
        },
        freeProductQty: {
            type: Number
        },
        freeProduct: {
            type: String
        }
    }],
    promoCodeWise: [{
        activityId: {
            type: String
        },
        promoCode: {
            type: String
        },
        promoAmount: {
            type: Number
        },
        startDate: {
            type: String
        },
        endDate: {
            type: String
        },
        status: {
            type: String
        }
    }],
    status: {
        type: String
    }
}, { timestamps: true })

export const Promotion = mongoose.model("promotion", PromotionSchema);