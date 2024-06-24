import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    departmentName: {
        type: String
    },
    departmentDesc: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Department = mongoose.model("department", DepartmentSchema)