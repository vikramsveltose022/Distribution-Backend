import mongoose from 'mongoose';

const WarehouseSchema = new mongoose.Schema({
  id: {
    type: String
  },
  created_by: {
    type: String
  },
  database: {
    type: String
  },
  warehouseName: {
    type: String
  },
  mobileNo: {
    type: Number
  },
  landlineNumber: {
    type: Number
  },
  address: {
    type: String
  },
  Password: {
    type: String
  },
  Username: {
    type: String
  },
  productItems: [{
    productId: {
      type: String
    },
    unitType: {
      type: String
    },
    primaryUnit: {
      type: String
    },
    secondaryUnit: {
      type: String
    },
    secondarySize: {
      type: String
    },
    Size: {
      type: Number
    },
    currentStock: {
      type: Number
    },
    transferQty: {
      type: Number
    },
    price: {
      type: Number
    },
    totalPrice: {
      type: Number
    },
    sgstRate: {
      type: Number
    },
    cgstRate: {
      type: Number
    },
    isgtRate: {
      type: Number
    },
    taxableAmount: {
      type: Number
    },
    grandTotal: {
      type: Number
    },
    gstPercentage: {
      type: String
    },
    igstTaxType: {
      type: Boolean
    },
    pendingStock: {
      type: Number,
      default: 0
    },
    damageItem: {
      type: Object
    },
    oQty: {
      type: Number,
      default: 0
    },
    oRate: {
      type: Number,
      default: 0
    },
    oBAmount: {
      type: Number,
      default: 0
    },
    oTaxRate: {
      type: Number,
      default: 0
    },
    oTotal: {
      type: Number,
      default: 0
    },
    pQty: {
      type: Number,
      default: 0
    },
    pRate: {
      type: Number,
      default: 0
    },
    pBAmount: {
      type: Number,
      default: 0
    },
    pTaxRate: {
      type: Number,
      default: 0
    },
    pTotal: {
      type: Number,
      default: 0
    },
    sQty: {
      type: Number,
      default: 0
    },
    sRate: {
      type: Number,
      default: 0
    },
    sBAmount: {
      type: Number,
      default: 0
    },
    sTaxRate: {
      type: Number,
      default: 0
    },
    sTotal: {
      type: Number,
      default: 0
    }
  }],
  grandTotal: {
    type: Number
  },
  warehouseFromId: {
    type: String
  },
  status: {
    type: String,
    default: "Active"
  },
  assignStatus: {
    type: Boolean,
    default: false
  },
  warehouseNo: {
    type: String
  }
}, { timestamps: true })

export const Warehouse = mongoose.model('warehouse', WarehouseSchema);
