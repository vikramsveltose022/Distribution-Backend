import mongoose from 'mongoose';

const TransporterSchema = new mongoose.Schema({
  id: {
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
  rolename: {
    type: String
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  contactNumber: {
    type: Number
  },
  pincode: {
    type: Number
  },
  address1: {
    type: String
  },
  address2: {
    type: String
  },
  companyName: {
    type: String
  },
  image: {
    type: String
  },
  gstNumber: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  serviceArea: [{
    BMName: {
      type: String
    },
    address: {
      type: String
    },
    contactNumber: {
      type: Number
    },
    pincode: {
      type: Number
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    gstNumber: {
      type: String
    },
    otherContactNumber: {
      type: String
    }
  }],
  status: {
    type: String,
    default: "Active"
  }
}, { timestamps: true });

export const Transporter = mongoose.model('transporter', TransporterSchema);
