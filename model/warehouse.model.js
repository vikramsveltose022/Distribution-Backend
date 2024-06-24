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
    }
  }],
  damageItem: [{
    productId: {
      type: String
    },
    unitType: {
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
    demagePercentage: {
      type: Number
    },
    reason: {
      type: String
    },
    typeStatus: {
      type: String
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
  }
}, { timestamps: true })

export const Warehouse = mongoose.model('warehouse', WarehouseSchema);
