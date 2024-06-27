import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  id: {
    type: String
  },
  code: {
    type: String
  },
  userName: {
    type: String
  },
  created_by: {
    type: String
  },
  database: {
    type: String
  },
  rolename: {
    type: String
  },
  rolename1: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  ownerName: {
    type: String
  },
  mobileNumber: {
    type: Number
  },
  passPortNo: {
    type: String
  },
  aadharNo: {
    type: Number
  },
  panNo: {
    type: String
  },
  personalPincode: {
    type: Number
  },
  Pcity: {
    type: String
  },
  Pstate: {
    type: String
  },
  address: {
    type: String
  },
  Photo: {
    type: String
  },
  password: {
    type: String
  },
  geotagging: {
    type: String
  },
  category: {
    type: String
  },
  duedate: {
    type: Number
  },
  lockInTime: {
    type: Number
  },
  limit: {
    type: Number
  },
  paymentTerm: {
    type: Number
  },
  transporterDetail: {
    type: Number
  },
  assignTransporter: {
    type: []
  },
  serviceArea: {
    type: String
  },
  partyType: {
    type: String
  },
  registrationType: {
    type: String
  },
  gstNumber: {
    type: String
  },
  email: {
    type: String
  },
  dealsInProducts: {
    type: String
  },
  annualTurnover: {
    type: Number
  },
  CompanyName: {
    type: String
  },
  CompanyAddress: {
    type: String
  },
  comPanNo: {
    type: String
  },
  contactNumber: {
    type: Number
  },
  pincode: {
    type: Number
  },
  State: {
    type: String
  },
  City: {
    type: String
  },
  shopSize: {
    type: String
  },
  address1: {
    type: String
  },
  address2: {
    type: String
  },
  shopPhoto: {
    type: []
  },
  status: {
    type: String,
    default: "Active"
  },
  otpVerify: {
    type: Number
  },
  autoBillingStatus: {
    type: String
  },
  latitude: {
    type: String
  },
  longitude: {
    type: String
  },
  currentAddress: {
    type: String
  },
  leadStatus: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export const Customer = mongoose.model("customer", CustomerSchema);