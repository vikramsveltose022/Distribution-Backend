import mongoose from "mongoose";

const GstSchema = new mongoose.Schema({
    created_by: {
        type: String
    },
    database: {
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
        }]
    }]
}, { timestamps: true })

export const GstDetails = mongoose.model("gstCalculate", GstSchema)