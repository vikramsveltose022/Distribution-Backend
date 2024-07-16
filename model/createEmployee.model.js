import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    created_by: {
        type: String
    },
    database: {
        type: String
    },
    Image: {
        type: String
    },
    Name: {
        type: String
    },
    DOB: {
        type: String
    },
    Address: {
        type: String
    },
    Email: {
        type: String
    },
    Password: {
        type: String
    },
    Contact: {
        type: String
    },
    Designation: {
        type: String
    },
    AadharNo: {
        type: String
    },
    PanNo: {
        type: String
    },
    ReferalName: {
        type: String
    },
    ReferalContactNo: {
        type: String
    },

}, { timestamps: true });

export const Employee = mongoose.model("employee", employeeSchema);
