import mongoose from "mongoose";

const FaceSchema = new mongoose.Schema({
    database: {
        type: String
    },
    userId:{
        type:String
    },
    image: {
        type: String
    },
    panNo: {
        type: String
    },
    name: {
        type: String
    }
}, { timestamps: true })

export const EmployeeVerify = mongoose.model("employeeVerify", FaceSchema)