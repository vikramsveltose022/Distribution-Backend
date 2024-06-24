import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
    branchName: {
        type: String
    },
    address: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    database: {
        type: String
    }
}, { timestamps: true })

export const UserBranch = mongoose.model("userBranch", BranchSchema)