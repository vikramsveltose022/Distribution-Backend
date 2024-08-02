import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    userId: {
        type: String
    },
    database: {
        type: String
    },
    departmentName: {
        type: String
    },
    roles: [{
        roleName: {
            type: String
        },
        roleId: {
            type: String
        },
        rolePosition: {
            type: Number
        },
        database: {
            type: String
        }
    }]
}, { timestamps: true })

export const AssignRole = mongoose.model("assignRole", DepartmentSchema)