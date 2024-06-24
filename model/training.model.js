import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema({
    database: {
        type: String
    },
    branch: {
        type: String
    },
    trainer: {
        type: String
    },
    trainingType: {
        type: String
    },
    trainingCost: {
        type: Number
    },
    employee: {
        type: []
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const Training = mongoose.model("training", TrainingSchema)