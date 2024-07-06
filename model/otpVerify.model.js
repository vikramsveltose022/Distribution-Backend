import mongoose from "mongoose";

const otpVerifySchema = new mongoose.Schema({
    database: {
        type: String
    },
    partyId: {
        type: String,
    },
    userId: {
        type: String
    },
    otp: {
        type: String
    },
    amount: {
        type: Number
    }
}, { timestamps: true })

export const OtpVerify = mongoose.model("otpVerify", otpVerifySchema);