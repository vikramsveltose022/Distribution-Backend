import mongoose from "mongoose";

const HierarchySchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
    }
}, { timestamps: true });

export const CreateHierarachy = mongoose.model("createHierarchy", HierarchySchema)