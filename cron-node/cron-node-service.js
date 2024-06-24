import axios from "axios";
import { Stock } from "../model/stock.js";
import { Warehouse } from "../model/warehouse.model.js";

export const closingStockUpdated = async () => {
    try {
        const response = await axios.get('https://node.rupioo.com/stock-updation/all-warehouse');
        console.log(response.data.message)
    } catch (err) {
        console.error(err.response.data);
    }
};
export const viewOpeningStockWarehouse = async () => {
    try {
        const ware = await Warehouse.find({}).sort({ sortorder: -1 }).select('_id');
        if (!ware) {
            return console.log("Not Found")
        }
        for (let id of ware) {
            let userData = await Warehouse.findById({ _id: id._id }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "damageItem.productId", model: "product" })
            const { _id, warehouseName, address, mobileNo, landlineNumber, productItems, damageItem, database } = userData
            const warehouse = {
                warehouseId: _id,
                warehouseName: warehouseName,
                mobileNumber: mobileNo,
                landlineNumber: landlineNumber,
                address: address,
                productItems: productItems,
                damageItem: damageItem,
                database: database,
                openingStatus: "opening"
            }
            if (warehouse) {
                const stock = await Stock.create(warehouse)
            }
        }
        return console.log("data saved successfull")
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const increaseTargetCreation = async () => {
    try {
        const response = await axios.get('https://node.rupioo.com/target-creation/increase-target/');
        console.log(response.data.message)
    } catch (err) {
        console.error(err.response.data);
    }
};