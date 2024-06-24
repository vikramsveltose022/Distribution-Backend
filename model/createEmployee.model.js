import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    name: {
        type: String
    },
    mobileNo: {
        type: Number
    },
    dob: {
        type: String
    },
    gender: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    address: {
        type: String
    },
    branch: {
        type: String
    },
    department: {
        type: String
    },
    designation: {
        type: String
    },
    joiningDate: {
        type: String
    },
    certificate: {
        type: String
    },
    resume: {
        type: String
    },
    photo: {
        type: String
    },
    accountHolderName: {
        type: String
    },
    accountNumber: {
        type: Number
    },
    bankName: {
        type: String
    },
    bankIdentifierCode: {
        type: String
    },
    branchLocation: {
        type: String
    },
    taxPayerId: {
        type: String
    }
}, { timestamps: true });

export const Employee = mongoose.model("employee", employeeSchema);
