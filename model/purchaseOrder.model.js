import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    Size: {
        type: Number
    },
    qty: {
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
    },
    status: {
        type: String,
        default: "ordered"
    },
    date: {
        type: Date,
        default: Date.now
    },
    igstTaxType: {
        type: Boolean
    },
    basicPrice: {
        type: Number
    },
    landedCost: {
        type: Number
    },
    primaryUnit: {
        type: String
    },
    secondaryUnit: {
        type: String
    },
    secondarySize: {
        type: Number
    },
    ReceiveQty: {
        type: String
    },
    DamageQty: {
        type: String
    }
}, { timestamps: true })
const PurchaseOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    partyId: {
        type: String
    },
    coolieAndCartage: {
        type: Number
    },
    transportationCost: {
        type: Number
    },
    labourCost: {
        type: Number
    },
    localFreight: {
        type: Number
    },
    miscellaneousCost: {
        type: Number
    },
    tax: {
        type: Number
    },
    maxGstPercentage: {
        type: Number
    },
    database: {
        type: String
    },
    invoiceId: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
    DateofDelivery: {
        type: String
    },
    fullName: {
        type: String
    },
    address: {
        type: String
    },
    MobileNo: {
        type: Number
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    landMark: {
        type: String
    },
    pincode: {
        type: Number
    },
    grandTotal: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: "pending"
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
    orderItems: [orderItemsSchema],
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
    vehicleNo: {
        type: String
    },
    otherCharges: {
        type: Number
    },
    gstOtherCharges: [],
    ARN: {
        type: String
    },
    ARNStatus: {
        type: Boolean,
        default: false
    },
    invoiceStatus: {
        type: Boolean,
        default: false
    },
    NoOfPackage: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const PurchaseOrder = mongoose.model("purchaseOrder", PurchaseOrderSchema)