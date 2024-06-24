import mongoose from 'mongoose';

const WarehouseItemSchema = new mongoose.Schema({
    created_by: {
        type: String
    },
    database: {
        type: String
    },
    warehouseName: {
        type: String
    },
    warehouseId: {
        type: String
    },
    productItems: [{
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
        price: {
            type: Number
        },
        totalPrice: {
            type: Number
        }
    }],
    grandTotal: {
        type: Number
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const WarehouseProductItem = mongoose.model('warehouseProductItem', WarehouseItemSchema);
