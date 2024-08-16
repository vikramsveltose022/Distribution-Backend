import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
  id: {
    type: String
  },
  branchName: {
    type: String,
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  database: {
    type: String,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  pincode: {
    type: String,
  },
  status: {
    type: String,
    default: "Active"
  }
},
  { timestamps: true }
);

export const UserBranch = mongoose.model("userBranch", BranchSchema);
