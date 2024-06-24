import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    productName: {
        type: String,
        maxLength: 100,
        description: "Product / Item Name"
    },
    productDesc: {
        type: String,
        maxLength: 100,
        description: "Product / Item description"
    },
    hsnCode: {
        type: Number,
        description: "HSN Code"
    },
    quantity: {
        type: Number,
        description: "Quantity"
    },
    qtyUnit: {
        type: String,
        maxLength: 3,
        minLength: 3,
        description: "Unit"
    },
    taxableAmount: {
        type: Number,
        multipleOf: 0.01,
        description: "Taxable Amount"
    },
    sgstRate: {
        type: Number,
        multipleOf: 0.001,
        description: "SGST Rate of Tax"
    },
    cgstRate: {
        type: Number,
        multipleOf: 0.001,
        description: "CGST Rate of Tax"
    },
    igstRate: {
        type: Number,
        multipleOf: 0.001,
        description: "IGST Rate of Tax"
    },
    cessRate: {
        type: Number,
        multipleOf: 0.001,
        description: "Cess Rate of Tax"
    },
    cessNonadvol: {
        type: Number,
        description: "Cess Non-Advolerum"
    },
}, { _id: false });

const userSchema = new mongoose.Schema({
    supplyType: {
        type: String,
        maxLength: 1,
        minLength: 1,
        enum: ["O", "I"],
        description: "Supply Type"
    },
    subSupplyType: {
        type: String,
        description: "Sub Supply Type"
    },
    subSupplyDesc: {
        type: String,
        maxLength: 20,
        description: "Other Sub Supply Description"
    },
    docType: {
        type: String,
        enum: ["INV", "CHL", "BIL", "BOE", "OTH"],
        description: "Document Type"
    },
    docNo: {
        type: String,
        maxLength: 16,
        description: "Document Number (Alphanumeric with / and - are allowed)"
    },
    docDate: {
        type: String,
        pattern: "[0-3][0-9]/[0-1][0-9]/[2][0][1-2][0-9]",
        description: "Document Date"
    },
    fromGstin: {
        type: String,
        maxLength: 15,
        minLength: 15,
        pattern: "[0-9]{2}[0-9|A-Z]{13}",
        description: "From GSTIN (Supplier or Consignor)"
    },
    fromTrdName: {
        type: String,
        maxLength: 100,
        description: "From Trade Name (Consignor Trade name)"
    },
    fromAddr1: {
        type: String,
        maxLength: 120,
        description: "From Address Line 1 (Valid Special Chars #,-,/)"
    },
    fromAddr2: {
        type: String,
        maxLength: 120,
        description: "From Address Line 2(Valid Special Chars # , - ,/)"
    },
    fromPlace: {
        type: String,
        maxLength: 50,
        description: "From Place"
    },
    actFromStateCode: {
        type: Number,
        maximum: 99,
        description: "Actual From State Code"
    },
    fromPincode: {
        type: Number,
        maximum: 999999,
        minimum: 100000, description: "From Pincode"
    },
    fromStateCode: {
        type: Number,
        maximum: 99,
        description: "From State Code"
    },
    toGstin: {
        type: String,
        maxLength: 15,
        minLength: 15,
        pattern: "[0-9]{2}[0-9|A-Z]{13}",
        description: "To GSTIN (Consignee or Recipient)"
    },
    toTrdName: {
        type: String,
        maxLength: 100,
        description: "To Trade Name (Consignee Trade name or Recipient Trade name)"
    },
    toAddr1: {
        type: String,
        maxLength: 120,
        description: "To Address Line 1 (Valid Special Chars #,-,/)"
    },
    toAddr2: {
        type: String,
        maxLength: 120,
        description: "To Address Line 2 (Valid Special Chars #,-,/)"
    },
    toPlace: {
        type: String,
        maxLength: 50,
        description: "To Place"
    },
    actToStateCode: {
        type: Number,
        maximum: 99,
        description: "Actual To State Code"
    },
    toPincode: {
        type: Number,
        description: "To Pincode"
    },
    toStateCode: {
        type: Number,
        maximum: 99,
        description: "To State Code"
    },
    transactionType: {
        type: Number,
        maximum: 4,
        description: "Transaction type"
    },
    totalValue: {
        type: Number,
        multipleOf: 0.01,
        description: "Sum of Taxable value"
    },
    cgstValue: {
        type: Number,
        multipleOf: 0.01,
        description: "CGST value"
    },
    sgstValue: {
        type: Number,
        multipleOf: 0.01,
        description: "SGST value"
    },
    igstValue: {
        type: Number,
        multipleOf: 0.01,
        description: "IGST value"
    },
    cessValue: {
        type: Number,
        multipleOf: 0.01,
        description: "Cess value"
    },
    cessNonAdvolValue: {
        type: Number,
        multipleOf: 0.01,
        description: "Cess Non Advol value"
    },
    otherValue: { type: Number, multipleOf: 0.01, description: "Other charges, if any" },
    totInvValue: {
        type: Number,
        multipleOf: 0.01,
        description: "Total Invoice Value (Including taxable value, tax value,and other charges if any)"
    },
    transMode: {
        type: String,
        enum: ["1", "2", "3", "4"],
        description: "Mode of transport (Road-1, Rail-2, Air-3, Ship-4)"
    },
    transDistance: {
        type: String,
        description: "Distance (<4000 km)"
    },
    transporterName: {
        type: String,
        maxLength: 100,
        description: "Name of the transporter"
    },
    transporterId: {
        type: String,
        pattern: "[0-9]{2}[0-9|A-Z]{13}",
        description: "15 Digit Transporter GSTIN/TRANSIN"
    },
    transDocNo: {
        type: String,
        maxLength: 15,
        description: "Transport Document Number (Alphanumeric with / and – are allowed)"
    },
    transDocDate: {
        type: String,
        description: "Transport Document Date"
    },
    vehicleNo: {
        type: String,
        minLength: 7,
        maxLength: 15,
        description: "Vehicle Number"
    },
    vehicleType: {
        type: String,
        description: "Vehicle Type"
    },
    itemList: {
        type: [itemSchema],
        required: true
    },
}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);
