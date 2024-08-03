import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  id: {
    type: String
  },
  profileImage: {
    type: String
  },
  code: {
    type: String
  },
  created_by: {
    type: String
  },
  database: {
    type: String
  },
  geotagging: {
    type: String
  },
  warehouse: [{
    id: {
      type: String
    }
  }],
  setRule: {
    type: []
  },
  rolename: {
    type: String
  },
  status: {
    type: String,
    default: "Active"
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  DOB: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  Father_name: {
    type: String
  },
  Father_MobileNo: {
    type: String
  },
  MotherMobileNo: {
    type: String
  },
  Thananame: {
    type: String
  },
  PassportNo: {
    type: String
  },
  DL_Num: {
    type: String
  },
  Aadhar_No: {
    type: String
  },
  Pan_No: {
    type: String
  },
  Account_Name: {
    type: String
  },
  Account_No: {
    type: String
  },
  Country: {
    type: String
  },
  State: {
    type: String
  },
  City: {
    type: String
  },
  pincode: {
    type: String
  },
  address1: {
    type: String
  },
  address2: {
    type: String
  },
  Ifsc_code: {
    type: String
  },
  Ref_name_one: {
    type: String
  },
  refer_Relation_one: {
    type: String
  },
  Ref_Mob_No_one: {
    type: String
  },
  Ref_name_sec: {
    type: String
  },
  refer_Relation_two: {
    type: String
  },
  Ref_Mob_No_two: {
    type: String
  },
  Ref_name_third: {
    type: String
  },
  refer_Relation_third: {
    type: String
  },
  Ref_Mob_No_third: {
    type: String
  },
  last_job_firm_name: {
    type: String
  },
  last_job_address: {
    type: String
  },
  last_job_PhNo: {
    type: String
  },
  last_job_Profile: {
    type: String
  },
  last_job_AppoitmentDate: {
    type: String
  },
  last_job_Designation: {
    type: String
  },
  last_job_Salary: {
    type: Number
  },
  otpVerify: {
    type: Number
  },
  typeStatus: {
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
  late_long: {
    type: String
  },
  pfPercentage: {
    type: String
  },
  area: {
    type: String
  },
  device: {
    type: String
  },
  deviceStatus: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String
  },
  planStart: {
    type: String
  },
  planEnd: {
    type: String
  },
  userRegister: {
    type: Number
  },
  userAllotted: {
    type: Number
  },
  billAmount: {
    type: Number
  },
  planStatus: {
    type: String,
    default: "unpaid"
  },
  externalImageId: {
    type: String
  },
  faceId: {
    type: String
  },
  imageUrl: {
    type: String
  },
  image: {
    type: String
  }, time: {
    type: String
  },
  branch: {
    type: String,
  },
  shift: {
    type: String,
  },
  otp: {
    type: String
  }
}, { timestamps: true });

export const User = mongoose.model('user', UserSchema);