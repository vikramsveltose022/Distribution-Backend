import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    id: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    subcategories: [
        {
            id: {
                type: String
            },
            created_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
            name: {
                type: String,
            },
            image: {
                type: String
            },
            description: {
                type: String
            },
            unitType: {
                type: String
            },
            status: {
                type: String
            }
        }
    ],
}, { timestamps: true });

export const Category = mongoose.model("category", categorySchema);
