import mongoose from "mongoose";

const roleSchema = mongoose.Schema({
    id: {
        type: String
    },
    roleId: {
        type: String
    },
    createdBy: {
        type: String
    },
    database: {
        type: String
    },
    roleName: {
        type: String
    },
    position: {
        type: Number
    },
    desc: {
        type: String
    },
    rank: {
        type: Number
    },
    assign: {
        type: Number,
        default: 0
    },
    top: {
        type: Number
    },
    rolePermission: []
}, { timestamps: true })

export const Role = mongoose.model("role", roleSchema);