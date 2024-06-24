import mongoose from 'mongoose';

const PurchaseReturnSchema = new mongoose.Schema({
    created_by: {
        type: String
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
    database: {
        type: String
    },
    invoiceId: {
        type: String
    },
    mobileNumber: {
        type: Number
    },
    email: {
        type: String
    },
    Return_amount: {
        type: Number
    },
    returnItems: [{
        productId: {
            type: String
        },
        qtyPurchase: {
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
    status: {
        type: String,
        default: "Active"
    },
    ARN: {
        type: String
    },
    ARNStatus: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })
export const PurchaseReturn = mongoose.model('purchaseReturn', PurchaseReturnSchema);
