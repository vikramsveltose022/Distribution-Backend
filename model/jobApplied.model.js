import mongoose from "mongoose";

const jobListingSchema = new mongoose.Schema({
    database: {
        type: String
    },
    job: {
        type: String
    },
    category: {
        type: String
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
    checkStatus: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true });
export const JobApplied = mongoose.model('jobApplied', jobListingSchema);
