import mongoose from "mongoose";

const jobListingSchema = new mongoose.Schema({
    database: {
        type: String
    },
    jobTitle: {
        type: String
    },
    branch: {
        type: String
    },
    jobCategory: {
        type: String
    },
    numberOfPositions: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String
    },
    skills: {
        type: String
    },
    jobDescription: {
        type: String
    },
    jobRequirements: {
        type: String
    }
}, { timestamps: true });
export const Job = mongoose.model('createJob', jobListingSchema);
