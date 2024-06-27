import axios from "axios";
import { Warehouse } from "../model/warehouse.model.js";
import { Factory } from "../model/factory.model.js";
import { Stock } from "../model/stock.js";
import { GstCalculateStock } from "../service/gstCalculate.js";

export const WarehouseXml = async (req, res) => {
    const fileUrl = "https://xmlfiles.nyc3.digitaloceanspaces.com/Warehouse.xml";
    try {
        const response = await axios.get(fileUrl);
        const data = response.data;
        return res.status(200).json({ data, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error reading the file");
    }
};

export const SaveWarehouse = async (req, res, next) => {
    try {
        // if (req.body.id) {
        //     const existing = await Warehouse.findOne({ id: req.body.id })
        //     if (existing) {
        //         return res.status(404).json({ message: "id already exist", status: false })
        //     }
        // } else {
        //     return res.status(400).json({ message: "id required", status: false })
        // }
        const warehouse = await Warehouse.create(req.body)
        return warehouse ? res.status(200).json({ message: "Data Save Successfully", Warehouse: warehouse, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewWarehouse = async (req, res, next) => {
    try {
        let warehouse = await Warehouse.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 }).populate({ path: 'productItems.productId', model: 'product' }).populate({ path: 'created_by', model: 'user' })
        return warehouse ? res.status(200).json({ Warehouse: warehouse, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const ViewWarehouseForProduct = async (req, res, next) => {
    try {
        let warehouse = await Warehouse.find({ database: req.params.database, status: "Active", assignStatus: true }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" })
        return warehouse ? res.status(200).json({ Warehouse: warehouse, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

export const ViewWarehouseList = async (req, res, next) => {
    try {
        let warehouse = await Warehouse.find({ database: req.params.database, status: "Active", assignStatus: false }).sort({ sortorder: -1 }).populate({ path: 'productItems.productId', model: 'product' })
        return warehouse ? res.status(200).json({ Warehouse: warehouse, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

export const ViewWarehouseById = async (req, res, next) => {
    try {
        let warehouse = await Warehouse.findById({ _id: req.params.id }).sort({ sortorder: -1 }).populate({ path: 'productItems.productId', model: 'product' })
        return warehouse ? res.status(200).json({ Warehouse: warehouse, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteWarehouse = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findById({ _id: req.params.id })
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
export const UpdateWarehouse = async (req, res, next) => {
    try {
        const warehouseId = req.params.id;
        const existingWarehouse = await Warehouse.findById(warehouseId);
        if (!existingWarehouse) {
            return res.status(404).json({ error: 'warehouse not found', status: false });
        }
        else {
            const updatedWarehouse = req.body;
            await Warehouse.findByIdAndUpdate(warehouseId, updatedWarehouse, { new: true });
            return res.status(200).json({ message: 'Warehouse Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};

export const getWarehouseData = async (req, res, next) => {
    try {
        const factory = await Factory.find({ warehouseToId: req.params.id }).populate({
            path: 'productItems.productId',
            model: 'product'
        }).populate({ path: "warehouseToId", model: "warehouse" }).exec();
        if (!factory || factory.length === 0) {
            return res.status(404).json({ message: "No Warehouse found", status: false });
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
                status: factory.status,
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

export const ViewWarehouseListIncharge = async (req, res, next) => {
    try {
        let warehouse = await Warehouse.find({ database: req.params.database, status: "Active", created_by: req.params.id }).sort({ sortorder: -1 }).populate({ path: 'productItems.productId', model: 'product' })
        return warehouse ? res.status(200).json({ Warehouse: warehouse, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

// warehouse report
export const WarehouseReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let warehouseList = []
        const warehouse = await Warehouse.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "productItems.productId", model: "product" })
        for (let id of warehouse) {
            const targetQuery1 = { warehouseId: id._id, closingStatus: "closing" };
            if (startDate && endDate) {
                targetQuery1.createdAt = { $gte: startDate, $lte: endDate };
            }
            const stock = await Stock.find(targetQuery1).sort({ sortorder: -1 });
            const lastStock = stock[stock.length - 1];
            const latestStock = await warehouseProductItem(id, lastStock);
            warehouseList.push(latestStock)
        }
        return (warehouseList.length > 0) ? res.status(200).json({ Warehouse: warehouseList, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const warehouseProductItem = async (body, lastStock) => {
    if (!Array.isArray(body.productItems) || !Array.isArray(lastStock.productItems)) {
        return { error: "Invalid input: productItems should be arrays" };
    }
    let matchingStocks = {};
    for (let id of body.productItems) {
        if (body._id.toString() === lastStock.warehouseId.toString()) {
            const stock = lastStock.productItems.find((item) => item.productId === id.productId._id);
            if (stock) {
                matchingStocks[id._id] = {
                    productId: id.productId,
                    pendingStock: id.pendingStock,
                    damageItem: id.damageItem,
                    closingStock: stock.currentStock,
                    warehouseName: body.warehouseName
                };
            } else {
                matchingStocks[id._id] = {
                    productId: id.productId,
                    pendingStock: id.pendingStock,
                    damageItem: id.damageItem,
                    closingStock: null,
                    warehouseName: body.warehouseName
                };
            }
        }
    }
    return matchingStocks;
};

// stock difference report
export const WarehouseDifferenceReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let warehouseList = [];
        let productList = [];
        let stockList = [];
        const warehouse = await Warehouse.find(targetQuery).populate({ path: "productItems.productId", model: "product" });
        if (warehouse.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        for (let ware of warehouse) {
            productList = productList.concat(ware.productItems);
        }
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1);
        const stockDate = req.body.endDate ? new Date(req.body.endDate) : currentDate;
        const lastStock = await Stock.find({ database: req.params.database, createdAt: { $gte: stockDate } }).populate({ path: "productItems.productId", model: "product" });
        if (lastStock.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        for (let ware of lastStock) {
            stockList = stockList.concat(ware.productItems);
        }
        const latest = await warehouseProductItem1(productList, stockList);
        warehouseList.push(latest);
        return (warehouseList.length > 0) ? res.status(200).json({ Warehouse: warehouseList, status: true }) : res.status(404).json({ message: "Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const warehouseProductItem1 = async (body, lastStock) => {
    let matchingStocks = {};
    for (let id of body) {
        const stock = lastStock.find((item) => item.productId === id.productId);
        if (stock) {
            if (!matchingStocks[id.productId._id]) {
                matchingStocks[id.productId._id] = {
                    productId: id.productId,
                    openingStock: 0,
                    warehouseStock: 0,
                    damageItem: 0,
                    difference: 0
                };
            }
            matchingStocks[id.productId._id].openingStock += stock.currentStock;
            matchingStocks[id.productId._id].warehouseStock += id.currentStock;
            matchingStocks[id.productId._id].damageItem += id?.damageItem?.transferQty || 0;

        }
    }
    return matchingStocks;
};

// HSN STOCK SUMMARY
export const HSNStockSummary = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let orders = [];
        const salesOrder = await Warehouse.find(targetQuery).populate({ path: "productItems.productId", model: "product" });
        if (salesOrder.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        for (let order of salesOrder) {
            orders = orders.concat(order.productItems);
        }
        const StockSummary = await GstCalculateStock(orders)
        const uniqueOrdersMap = new Map();
        for (let orderItem of StockSummary) {
            const key = orderItem.HSN_Code;
            if (uniqueOrdersMap.has(key)) {
                const existingOrder = uniqueOrdersMap.get(key);
                existingOrder.taxableAmount += orderItem.taxableAmount;
                existingOrder.cgstRate += orderItem.cgstRate;
                existingOrder.qty += orderItem.qty;
                existingOrder.sgstRate += orderItem.sgstRate;
                existingOrder.igstRate += orderItem.igstRate;
                existingOrder.grandTotal += orderItem.grandTotal;
                // existingOrder.gstPercentage = orderItem.gstPercentage;
            } else {
                const newOrder = {
                    HSN_Code: orderItem.HSN_Code,
                    Product_Desc: orderItem.Product_Desc,
                    unitType: orderItem.unitType,
                    qty: orderItem.qty,
                    grandTotal: orderItem.grandTotal,
                    gstPercentage: orderItem.gstPercentage,
                    taxableAmount: orderItem.taxableAmount,
                    igstRate: orderItem.igstRate,
                    cgstRate: orderItem.cgstRate,
                    sgstRate: orderItem.sgstRate,
                };
                uniqueOrdersMap.set(key, newOrder);
            }
        }
        const uniqueOrders = Array.from(uniqueOrdersMap.values());
        return res.status(200).json({ HSNStock: uniqueOrders, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
