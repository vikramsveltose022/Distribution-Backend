import mongoose from "mongoose";

const JobCategorySchema = new mongoose.Schema({
    database: {
        type: String
    },
    name: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

const BatchJobSchema = new mongoose.Schema({
    database: {
        type: String
    },
    name: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const JobCateogry = mongoose.model("jobCategory", JobCategorySchema)
export const JobBatch = mongoose.model("jobBatch", BatchJobSchema)