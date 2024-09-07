import dotenv from "dotenv"
import Jwt from "jsonwebtoken";
import { Warehouse } from "../model/warehouse.model.js";
import { Factory } from "../model/factory.model.js";
import { Stock } from "../model/stock.js";
import { GstCalculateStock } from "../service/gstCalculate.js";
import moment from "moment";
import { Product } from "../model/product.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { Role } from "../model/role.model.js";
import { Customer } from "../model/customer.model.js";
dotenv.config();

export const SignIn = async (req, res, next) => {
    try {
        const { Username, Password } = req.body;
        let warehouse = await Warehouse.findOne({ Username: Username })
        if (!warehouse) {
            return res.status(400).json({ message: "Incorrect Warehouse Username", status: false });
        }
        if (warehouse && warehouse.Password !== Password) {
            return res.status(400).json({ message: "Incorrect Password", status: false });
        }
        if (warehouse) {
            const token = Jwt.sign({ subject: Username }, process.env.TOKEN_SECRET_KEY);
            return res.status(200).json({ message: "Warehouse SignIn Successfull!", warehouse: { ...warehouse.toObject(), Password: undefined, token: token }, status: true })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const SaveWarehouse = async (req, res, next) => {
    try {
        if (req.body.id) {
            const existing = await Warehouse.findOne({ status: "Active", database: req.body.database, id: req.body.id })
            if (existing) {
                return res.status(404).json({ message: "id already exist", status: false })
            }
        } else {
            return res.status(400).json({ message: "warehouse id required", status: false })
        }
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
        let warehouse = await Warehouse.find({ database: req.params.database, status: "Active", assignStatus: true }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: 'created_by', model: 'user' })
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
            const stock = lastStock.productItems.find((item) => item.productId.toString() === id?.productId?._id.toString());
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
        const stock = lastStock.find((item) => item.productId._id.toString() === id?.productId?._id.toString());
        // console.log(stock)
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

        } else {
            if (!matchingStocks[id.productId._id]) {
                matchingStocks[id.productId._id] = {
                    productId: id.productId,
                    openingStock: 0,
                    warehouseStock: 0,
                    damageItem: 0,
                    difference: 0
                };
            }
            // matchingStocks[id.productId._id].openingStock += stock.currentStock;
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

//  For DashBoard
export const StockCalculate11 = async (req, res, next) => {
    try {
        let WarehouseStock = {
            OpeningStock: 0,
            ClosingStock: 0,
            DeadStock: 0,
            DamageStock: 0,
            WarehouseStock: 0
        };
        let warehouses = []
        let closing = []
        // const previousMonthStart = moment().subtract(1, 'months').startOf('month').toDate();
        // const previousMonthEnd = moment().subtract(1, 'months').endOf('month').toDate();
        const twoDaysAgoEnd = moment().subtract(1, 'days').endOf('day').toDate();
        const product = await Product.find({ database: req.params.database }).sort({ sortorder: -1 })
        const warehouse = await Warehouse.find({ database: req.params.database }).sort({ sortorder: -1 })
        if (warehouse.length === 0) {
            // return res.status(404).json({ message: "Sales Order Not Found", status: false })
        }
        const openingData = await Stock.find({
            database: req.params.database,
            createdAt: { $gte: twoDaysAgoEnd }
        }).sort({ sortorder: -1 });
        for (let item of warehouse) {
            warehouses = warehouses.concat(item.productItems)
        }
        for (let item of warehouses) {
            WarehouseStock.WarehouseStock += item?.currentStock
            WarehouseStock.DamageStock += item?.damageItem?.currentStock
        }
        for (let item of openingData) {
            closing = closing.concat(item.productItems)
        }
        for (let item of closing) {
            WarehouseStock.ClosingStock += item.currentStock
        }
        for (let item of product) {
            WarehouseStock.OpeningStock += item.qty
        }
        WarehouseStock.DamageStock = (WarehouseStock.DamageStock == NaN) ? 0 : WarehouseStock.DamageStock
        WarehouseStock.DeadStock = await ViewOverDueStock(req.params.database)
        res.status(200).json({ WarehouseStock, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const StockCalculate = async (req, res, next) => {
    try {
        let WarehouseStock = {
            OpeningStock: 0,
            ClosingStock: 0,
            DeadStock: 0,
            DamageStock: 0,
            WarehouseStock: 0
        };
        const twoDaysAgoEnd = moment().subtract(1, 'days').endOf('day').toDate();
        const products = await Product.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 });
        const warehouses = await Warehouse.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 });
        if (warehouses.length === 0) {
            // return res.status(404).json({ message: "Warehouse Not Found", status: false });
        }
        const openingData = await Stock.find({
            database: req.params.database, createdAt: { $gte: twoDaysAgoEnd }
        }).sort({ sortorder: -1 });
        warehouses.forEach(warehouse => {
            warehouse.productItems.forEach(item => {
                WarehouseStock.WarehouseStock += item?.currentStock || 0;
                WarehouseStock.DamageStock += item?.damageItem?.transferQty || 0;
            });
        });
        openingData.forEach(stock => {
            stock.productItems.forEach(item => {
                WarehouseStock.ClosingStock += item.currentStock || 0;
            });
        });
        products.forEach(product => {
            WarehouseStock.OpeningStock += product.qty || 0;
        });
        WarehouseStock.DamageStock = isNaN(WarehouseStock.DamageStock) ? 0 : WarehouseStock.DamageStock;
        WarehouseStock.DeadStock = await ViewOverDueStock(req.params.database);

        res.status(200).json({ WarehouseStock, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const ViewOverDueStock = async (body) => {
    try {
        const currentDate = moment();
        let deadStock = 0;
        const startOfLastMonth = currentDate.clone().subtract(30, 'days');
        const productsNotOrderedLastMonth = await Product.find({ database: body, status: "Active", createdAt: { $lt: startOfLastMonth.toDate() } }).populate({ path: "partyId", model: "customer" });
        if (!productsNotOrderedLastMonth || productsNotOrderedLastMonth.length === 0) {
            // return res.status(404).json({ message: "No products found", status: false });
        }
        const orderedProductsLastMonth = await CreateOrder.find({ database: body.database, createdAt: { $gte: startOfLastMonth.toDate() } }).distinct('orderItems');
        if (orderedProductsLastMonth.length > 0) {
            const orderedProductIdsLastMonth = orderedProductsLastMonth.map(orderItem => orderItem.productId.toString());
            const productsToProcess = productsNotOrderedLastMonth.filter(product =>
                !orderedProductIdsLastMonth.includes(product._id.toString()));
            const warehouseIds = productsToProcess.map(product => product.warehouse);
            const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } });
            const allProduct = productsToProcess.map(product => {
                const warehouse = warehouses.find(warehouse => warehouse._id.toString() === product.warehouse.toString());
                const qty = warehouse ? warehouse.productItems.find(item => item.productId.toString() === product._id.toString()) : null;
                console.log(qty.currentStock)
                deadStock += qty?.currentStock || 0;
                console.log(deadStock)
                return {
                    product,
                    Qty: qty ? qty.currentStock : null,
                    deadStock
                };
            });
            return allProduct[allProduct.length - 1].deadStock
        } else {
            return 0
        }
    } catch (err) {
        console.error(err);
        // return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

// export const savedd = async (req, res, next) => {
//     try {
//         const rolesss = []
//         const role = await Role.find({ database: "" })
//         if (role.length === 0) {
//             return res.status(404).json({ message: "Not Found", status: false })
//         }
//         // console.log(role.length)
//         for (let item of role) {
//             const [roleId, rolename] = item.roleName.split(" ")
//             console.log(roleId)
//             item.id = roleId
//             const roleupdated = await item.save()
//             rolesss.push(roleupdated)
//         }
//         res.status(200).json({ role: rolesss, status: true })
//     }
//     catch (err) {
//         console.log(err)
//         return res.status(500).json({ error: "Internal Server Error", status: false })
//     }
// }
export const savedd = async (req, res, next) => {
    try {
        let count = 0
        const exist = await Customer.find({ database: req.params.database, status: "Deactive" })
        if (exist.length === 0) {
            return res.status(404).json({ message: "warehouse not found", status: false })
        }
        for (let item of exist) {
            await Customer.findByIdAndDelete(item._id)
            // const warehouse = await Warehouse.findOne({ "productItems.productId": item._id.toString() })
            // if (warehouse) {
            //     count++
            //     warehouse.productItems = warehouse.productItems.filter(sub => sub.productId.toString() !== item._id.toString());
            //     await warehouse.save();
            // }
            // item.qty = item.Opening_Stock
            // item.pendingQty = 0
            // await item.save()

            // const warehouse = await Warehouse.findById(item.warehouse)
            // if (warehouse) {
            //     let ware = {
            //         productId: item._id.toString(),
            //         primaryUnit: item.primaryUnit,
            //         secondaryUnit: item.secondaryUnit,
            //         secondarySize: item.secondarySize,
            //         currentStock: item.qty,
            //         transferQty: item.qty,
            //         price: item.Purchase_Rate,
            //         totalPrice: (item.qty * item.Purchase_Rate),
            //         gstPercentage: item.GSTRate,
            //         igstType: item.igstType,
            //         oQty: item.Opening_Stock,
            //         oRate: item.Purchase_Rate,
            //         oBAmount: (((item.Opening_Stock * item.Purchase_Rate) * 100) / (item.GSTRate + 100)),
            //         oTaxRate: (item.GSTRate),
            //         oTotal: (item.Opening_Stock * item.Purchase_Rate),
            //     }
            //     const updated = await Warehouse.updateOne({ _id: item.warehouse }, { $push: { productItems: ware }, }, { upsert: true });
            // }
        }
        return res.status(200).json({ message: "success", count, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const StockClose = async () => {
    try {
        const warehouses = await Warehouse.find({ status: "Active" }).sort({ sortorder: -1 });
        if (warehouses.length === 0) {
            console.log("Warehouse not found");
            return;
        }
        for (let warehouse of warehouses) {
            const closingStock = await ClosingStock(warehouse.productItems);
            const warehouseData = {
                warehouseId: warehouse._id.toString(),
                warehouseName: warehouse.warehouseName,
                mobileNumber: warehouse.mobileNo,
                landlineNumber: warehouse.landlineNumber,
                address: warehouse.address,
                productItems: closingStock,
                database: warehouse.database,
                closingStatus: "closing"
            };

            await Stock.create(warehouseData);

            for (let productItem of warehouse.productItems) {
                productItem.pQty = 0;
                productItem.pRate = 0;
                productItem.pTaxRate = 0;
                productItem.pTotal = 0;
                productItem.sQty = 0;
                productItem.sRate = 0;
                productItem.sTaxRate = 0;
                productItem.sTotal = 0;
                await warehouse.save();
            }
        }
    } catch (err) {
        console.error("Error in StockClose function:", err);
    }
}
const ClosingStock = async (productItems) => {
    try {
        const stock = [];
        for (let item of productItems) {
            let warehouseStock = {
                productId: item.productId,
                currentStock: item.currentStock,
                price: item.price,
                totalPrice: item.totalPrice,
                gstPercentage: item.gstPercentage,
                oQty: item.oQty,
                oRate: item.oRate,
                oTaxRate: item.oTaxRate,
                oTotal: item.oTotal,
                pQty: item.pQty,
                pRate: item.pRate,
                pTaxRate: item.pTaxRate,
                pTotal: item.pTotal,
                sQty: item.sQty,
                sRate: item.sRate,
                sTaxRate: item.sTaxRate,
                sTotal: item.sTotal,
            };
            stock.push(warehouseStock);
        }
        return stock;
    } catch (err) {
        console.error("Error in ClosingStock function:", err);
    }
}