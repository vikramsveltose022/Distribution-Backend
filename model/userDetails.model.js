import mongoose from "mongoose"

const UserDetailSchema = new mongoose.Schema({
    database: {
        type: String
    },
    userId: {
        type: String
    },
    photo: {
        type: String
    },
    signature: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const UserDetail = mongoose.model("userDetail", UserDetailSchema)