import mongoose from "mongoose";

const CreateAccountSchema = new mongoose.Schema({
    id: {
        type: String
    },
    database: {
        type: String
    },
    title: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const CreateAccount = mongoose.model("createAccount", CreateAccountSchema)