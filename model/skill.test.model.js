import mongoose from "mongoose";

const SkillTestSchema = new mongoose.Schema({
    database: {
        type: String
    },
    question: {
        type: String
    },
    option: {
        type: String
    },
    rightAnswer: {
        type: String
    },
    desc: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true });

export const SkillTest = mongoose.model("skillTest", SkillTestSchema)