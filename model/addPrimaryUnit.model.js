import mongoose from "mongoose"

const PrimaryUnitSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    primaryUnit: {
        type: String
    }
}, { timestamps: true })

export const PrimaryUnit = mongoose.model("primaryUnit", PrimaryUnitSchema)