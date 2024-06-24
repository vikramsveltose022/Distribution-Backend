import { WarehouseProductItem } from "../model/warehouseProductItem.model.js";

export const SaveProductItem = async (req, res, next) => {
    try {
        const items = await WarehouseProductItem.create(req.body)
        return items ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "Bad Request", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewProductItem = async (req, res, next) => {
    try {
        const items = await WarehouseProductItem.find({}).sort({ sortorder: -1 }).populate({ path: "warehouseId", model: "warehouse" }).populate({ path: "productItems.productId", model: "product" })
        return (items.length > 0) ? res.status(200).json({ ProductItems: items, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error", status: false })
    }
}
export const ViewProductItemsById = async (req, res, next) => {
    try {
        let warehouse = await WarehouseProductItem.findById({ _id: req.params.id }).sort({ sortorder: -1 }).populate({ path: "warehouseId", model: "warehouse" }).populate({ path: 'productItems.productId', model: 'product' })
        return warehouse ? res.status(200).json({ ProductItems: warehouse, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteProductItems = async (req, res, next) => {
    try {
        const warehouse = await WarehouseProductItem.findById({ _id: req.params.id })
        if (!warehouse) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        warehouse.status = "Deactive"
        await warehouse.save();
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const UpdateProductItems = async (req, res, next) => {
    try {
        const warehouseId = req.params.id;
        const existingWarehouse = await WarehouseProductItem.findById(warehouseId);
        if (!existingWarehouse) {
            return res.status(404).json({ error: 'productItems not found', status: false });
        }
        else {
            const updatedWarehouse = req.body;
            await WarehouseProductItem.findByIdAndUpdate(warehouseId, updatedWarehouse, { new: true });
            return res.status(200).json({ message: 'Warehouse ProductItems Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};