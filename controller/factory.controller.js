import { Factory } from "../model/factory.model.js";
import { StockUpdation } from "../model/stockUpdation.model.js";
import { User } from "../model/user.model.js";

export const saveFactorytoWarehouse1 = async (req, res, next) => {
    try {
        const { warehouseToId, grandTotal, transferStatus, stockTransferDate, productItems } = req.body;
        const existingWarehouse = await User.findById(warehouseToId);
        if (!existingWarehouse) {
            return res.status(404).json({ message: 'Warehouse not found', status: false });
        }
        const factory = await Factory.create(req.body);
        req.body.exportId = await factory._id;
        const stock = await StockUpdation.create(req.body);
        existingWarehouse.grandTotal = grandTotal;
        existingWarehouse.stockTransferDate = stockTransferDate;
        existingWarehouse.transferStatus = transferStatus;
        existingWarehouse.exportId = factory._id;
        productItems.forEach(item => {
            existingWarehouse.productItems.push(item);
        });
        await existingWarehouse.save();
        return res.status(200).json({ Factory: factory, Warehouse: existingWarehouse, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const getFactoryData = async (req, res, next) => {
    try {
        const database = req.params.database;
        const factory = await Factory.find({ database: database }).populate({
            path: 'productItems.productId',
            model: 'product'
        }).populate({ path: "warehouseToId", model: "user" }).exec();
        if (!factory || factory.length === 0) {
            return res.status(404).json({ message: "No factory found", status: false });
        }
        const factoryProductItems = factory.map(factory => {
            const formattedItems = factory.productItems.map(item => ({
                product: item.productId,
                unitType: item.unitType,
                Size: item.Size,
                transferQty: item.transferQty,
                price: item.price,
                totalPrice: item.totalPrice
            }));
            return {
                _id: factory._id,
                stockTransferDate: factory.stockTransferDate,
                warehouseToId: factory.warehouseToId,
                grandTotal: factory.grandTotal,
                productItems: formattedItems,
                transferStatus: factory.transferStatus,
                createdAt: factory.createdAt,
                updatedAt: factory.updatedAt
            };
        });
        return res.status(200).json({ Factory: factoryProductItems, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false });
    }
};
export const updateFactorytoWarehouse = async (req, res, next) => {
    try {
        const factoryId = req.params.id
        const { grandTotal, transferStatus, stockTransferDate, productItems } = req.body;
        const existingFactory = await Factory.findById(factoryId);
        if (!existingFactory) {
            return res.status(404).json({ message: 'Factory not found', status: false });
        }
        const factory = await Factory.findByIdAndUpdate(factoryId, req.body, { new: true })
        // existingWarehouse.grandTotal = grandTotal;
        // existingWarehouse.stockTransferDate = stockTransferDate;
        // existingWarehouse.status = status;
        // existingWarehouse.productItems = productItems;
        // await existingWarehouse.save();
        const warehouseId = existingFactory.warehouseToId;
        const existingWarehouse = await User.findByIdAndUpdate(warehouseId, req.body, { new: true });
        if (!existingWarehouse) {
            return res.status(404).json({ message: 'Warehouse not found', status: false });
        }
        return res.status(200).json({ Warehouse: existingWarehouse, Factory: factory, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const saveFactorytoWarehouse = async (req, res, next) => {
    try {
        const { warehouseToId, grandTotal, transferStatus, stockTransferDate, productItems } = req.body;
        const existingWarehouse = await User.findById(warehouseToId);
        if (!existingWarehouse) {
            return res.status(404).json({ message: 'Warehouse not found', status: false });
        }
        req.body.database = existingWarehouse.database;
        const factory = await Factory.create(req.body);
        req.body.exportId = factory._id;
        req.body.database = existingWarehouse.database;
        const stock = await StockUpdation.create(req.body);
        existingWarehouse.grandTotal = grandTotal;
        existingWarehouse.stockTransferDate = stockTransferDate;
        existingWarehouse.transferStatus = transferStatus;
        existingWarehouse.exportId = factory._id;

        productItems.forEach(item => {
            const existingProduct = existingWarehouse.productItems.find(
                existingItem => existingItem.productId === item.productId
            );
            if (existingProduct) {
                existingProduct.Size += item.Size;
                existingProduct.transferQty += item.transferQty;
                existingProduct.currentStock += (item.Size * item.transferQty);
            } else {
                existingWarehouse.productItems.push(item);
            }
        });
        await existingWarehouse.save();
        return res.status(200).json({ Factory: factory, Warehouse: existingWarehouse, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const deleteProductFromWarehouse = async (req, res, next) => {
    try {
        const { warehouseId, productId } = req.params;
        const existingWarehouse = await User.findById(warehouseId);

        if (!existingWarehouse) {
            return res.status(404).json({ message: 'Warehouse not found', status: false });
        }
        const productIndex = existingWarehouse.productItems.findIndex(
            item => item.productId === productId
        );
        if (productIndex !== -1) {
            const deletedProduct = existingWarehouse.productItems[productIndex];
            existingWarehouse.productItems[productIndex].quantity -= 1;
            if (existingWarehouse.productItems[productIndex].quantity === 0) {
                existingWarehouse.productItems.splice(productIndex, 1);
            }
            await existingWarehouse.save();
            const factoryId = deletedProduct.factoryId;
            return res.status(200).json({
                message: 'Product deleted from warehouse successfully',
                factoryId: factoryId,
                status: true
            });
        } else {
            return res.status(404).json({
                message: 'Product not found in the warehouse',
                status: false
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};


