import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    database: {
        type: String
    },
    reDate: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    gstNo: {
        type: String
    },
    stateCode: {
        type: Number
    },
    actStateCode: {
        type: Number
    },
    address: {
        type: String
    },
    address1: {
        type: String
    },
    address2: {
        type: String
    },
    place: {
        type: String
    },
    mobileNo: {
        type: String
    },
    logo: {
        type: String
    },
    signature: {
        type: String
    },
    Prefix: {
        type: String
    },
    Suffix: {
        type: Number
    },
    billNo: {
        type: Number
    },
    dummy: {
        type: Number
    },
    bankName: {
        type: String
    },
    bankIFSC: {
        type: String
    },
    accountNumber: {
        type: Number
    },
    branchName: {
        type: String
    },
    upiId: {
        type: String
    },
    gpay_PhonepayNumber: {
        type: Number
    },
    imagePosition: {
        type: String
    },
    billTo: {
        type: String
    },
    shipto: {
        type: String
    },
    BillNumber: {
        type: String
    },
    termsAndCondition: {
        type: String
    },
    orderNo: {
        type: Number,
        default: 0
    },
    warehouseDummy: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
export const CompanyDetails = mongoose.model("companyDetail", CompanySchema)