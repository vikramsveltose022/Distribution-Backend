import mongoose from "mongoose";

const jobListingSchema = new mongoose.Schema({
    database: {
        type: String
    },
    candidateName: {
        type: String
    },
    dateOfInterview: {
        type: String
    },
    interviewTime: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true });
export const Interview = mongoose.model('interview', jobListingSchema);
