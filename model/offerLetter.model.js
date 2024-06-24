import mongoose from "mongoose";

const OfferLetterSchema = new mongoose.Schema({
    database:{
        type:String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    mobileNo: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const OfferLetter = mongoose.model("offerLetter", OfferLetterSchema)