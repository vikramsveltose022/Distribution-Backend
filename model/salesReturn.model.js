import mongoose from "mongoose";

const SalesReturnSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    database: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    partyId: {
        type: String
    },
    orderId: {
        type: String
    },
    returnItems: [{
        productId: {
            type: String
        },
        qtySales: {
            type: Number
        },
        qtyReturn: {
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
        igstRate: {
            type: Number
        },
        taxableAmount: {
            type: Number
        },
        grandTotal: {
            type: Number
        },
        unitType: {
            type: String
        },
        discountPercentage: {
            type: Number
        },
        gstPercentage: {
            type: String
        },
        totalPriceWithDiscount: {
            type: Number
        }
    }],
    mobileNumber: {
        type: String
    },
    email: {
        type: String
    },
    Return_amount: {
        type: Number
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    currentAddress: {
        type: String
    },
    paymentId: {
        type: String
    },
    paymentMode: {
        type: String
    },
    reason: {
        type: String
    },
    roundOff: {
        type: Number
    },
    amount: {
        type: Number
    },
    sgstTotal: {
        type: Number
    },
    cgstTotal: {
        type: Number
    },
    igstTotal: {
        type: Number
    },
    discountAmount: {
        type: Number
    },
    igstTaxType: {
        type: Number
    },
    gstDetails: [{
        hsn: {
            type: String
        },
        taxable: {
            type: Number
        },
        centralTax: [{
            rate: {
                type: Number
            },
            amount: {
                type: Number
            }
        }],
        stateTax: [{
            rate: {
                type: Number
            },
            amount: {
                type: Number
            }
        }],
        igstTax: [{
            rate: {
                type: Number
            },
            amount: {
                type: Number
            }
        }],
        discountPercentage: {
            type: Number
        },
        withoutDiscountAmount: {
            type: Number,
        },
        withDiscountAmount: {
            type: Number
        },
        withoutTaxablePrice: {
            type: Number
        }
    }],
    transporter: {
        type: Object
    },
    otherCharges: {
        type: Number
    },
    gstOtherCharges: [],
    ARN: {
        type: String
    },
    ARNStatus:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })
export const SalesReturn = mongoose.model("salesReturn", SalesReturnSchema)