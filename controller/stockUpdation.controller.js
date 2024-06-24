import moment from "moment"
import { StockUpdation } from "../model/stockUpdation.model.js";
import { User } from "../model/user.model.js";
import { Factory } from "../model/factory.model.js";
import { Stock } from "../model/stock.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { Warehouse } from "../model/warehouse.model.js";
import { Product } from "../model/product.model.js";
import { Customer } from "../model/customer.model.js";
import { Receipt } from "../model/receipt.model.js";
import { ClosingStock } from "../model/closingStock.model.js";

export const viewInWardStockToWarehouse = async (req, res, next) => {
    try {
        const stock = await StockUpdation.find({ warehouseToId: req.params.id, transferStatus: "InProcess" }).populate({ path: 'productItems.productId', model: 'product' }).populate({ path: "warehouseFromId", model: "warehouse" }).populate({ path: "warehouseToId", model: "warehouse" }).exec();
        if (!stock || stock.length === 0) {
            return res.status(404).json({ message: "No warehouse found", status: false });
        }
        return res.status(200).json({ Warehouse: stock, status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false });
    }
};
export const viewOutWardStockToWarehouse = async (req, res, next) => {
    try {
        const stock = await StockUpdation.find({ warehouseFromId: req.params.id, transferStatus: "InProcess" }).populate({ path: 'productItems.productId', model: 'product' }).populate({ path: "warehouseToId", model: "warehouse" }).populate({ path: "warehouseFromId", model: "warehouse" }).exec();
        if (!stock || stock.length === 0) {
            return res.status(404).json({ message: "No warehouse found", status: false });
        }
        return res.status(200).json({ Warehouse: stock, status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false });
    }
};
export const stockTransferToWarehouse = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        const { warehouseToId, warehouseFromId, stockTransferDate, productItems, grandTotal, transferStatus, created_by, InwardStatus, OutwardStatus } = req.body;
        for (const item of productItems) {
            const sourceProduct = await Warehouse.findOne({
                _id: warehouseFromId,
                'productItems.productId': item.productId,
            });
            if (sourceProduct) {
                const sourceProductItem = sourceProduct.productItems.find(
                    (pItem) => pItem.productId === item.productId);
                if (sourceProductItem) {
                    sourceProductItem.Size = item.Size;
                    sourceProductItem.currentStock -= (item.transferQty * item.Size);
                    sourceProductItem.totalPrice -= item.totalPrice;
                    sourceProduct.markModified('productItems');
                    await sourceProduct.save();
                    // const destinationProduct = await Warehouse.findOne({
                    //     _id: warehouseToId,
                    //     'productItems.productId': item.productId,
                    // });
                    // if (destinationProduct) {
                    //     const destinationProductItem = destinationProduct.productItems.find((pItem) => pItem.productId === item.productId);
                    //     destinationProductItem.Size = item.Size;
                    //     destinationProductItem.currentStock += (item.transferQty * item.Size);
                    //     destinationProductItem.totalPrice += item.totalPrice;
                    //     await destinationProduct.save();
                    // } else {
                    //     await Warehouse.updateOne({ _id: warehouseToId },
                    //         {
                    //             $push: { productItems: item },
                    //             $set: {
                    //                 stockTransferDate: stockTransferDate,
                    //                 transferStatus: transferStatus,
                    //                 grandTotal: grandTotal,
                    //                 warehouseFromId: warehouseFromId
                    //             }
                    //         },
                    //         { upsert: true });
                    // }
                } else {
                    return res.status(400).json({ error: 'Insufficient quantity in the source warehouse or product not found' });
                }
            } else {
                return res.status(400).json({ error: 'Product not found in the source warehouse' });
            }
        }
        const stockTransfer = new StockUpdation({
            created_by,
            warehouseToId,
            warehouseFromId,
            stockTransferDate,
            productItems,
            grandTotal,
            transferStatus,
            InwardStatus,
            OutwardStatus,
            database: user.database
        });
        await stockTransfer.save();
        return res.status(201).json({ message: 'Stock transfer successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const viewWarehouseStock = async (req, res) => {
    try {
        const database = req.params.database;
        const warehouse = await StockUpdation.find({ database: database }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "warehouseToId", model: "warehouse" }).populate({ path: "warehouseFromId", model: "warehouse" });
        if (warehouse.length > 0) {
            return res.status(200).json({ Warehouse: warehouse, status: true });
        } else {
            return res.status(404).json({ message: 'Warehouse not found', status: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
export const updateWarehousetoWarehouse = async (req, res, next) => {
    try {
        const factoryId = req.params.id
        const existingFactory = await StockUpdation.findById({ _id: factoryId });
        if (!existingFactory) {
            return res.status(404).json({ message: 'Warehouse not found', status: false });
        }
        await StockUpdation.findByIdAndUpdate(factoryId, req.body, { new: true })
        for (const item of existingFactory.productItems) {
            const destinationProduct = await Warehouse.findOne({
                _id: existingFactory.warehouseToId,
                'productItems.productId': item.productId,
            });
            if (destinationProduct) {
                const destinationProductItem = destinationProduct.productItems.find((pItem) => pItem.productId.toString() === item.productId.toString());
                destinationProductItem.Size = item.Size;
                destinationProductItem.currentStock += (item.transferQty * item.Size);
                destinationProductItem.totalPrice += item.totalPrice;
                await destinationProduct.save();
            } else {
                await Warehouse.updateOne({ _id: existingFactory.warehouseToId },
                    {
                        $push: { productItems: item },
                        $set: {
                            stockTransferDate: existingFactory.stockTransferDate,
                            transferStatus: existingFactory.transferStatus,
                            grandTotal: existingFactory.grandTotal,
                            warehouseFromId: existingFactory.warehouseFromId
                        }
                    },
                    { upsert: true });
            }
        }
        return res.status(200).json({ message: "status updated successfull!", status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
// doubt
export const viewProductInWarehouse = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id).populate({ path: "productItems.productId", model: "product" });
        if (!warehouse) {
            return res.status(400).json({ message: "Not Found", status: true });
        }
        const productDetails = warehouse.productItems.map(item => {
            return {
                productId: item.productId._id,
                created_by: item.productId.created_by,
                Product_Title: item.productId.Product_Title,
                Size: item.productId.Size,
                discount: item.productId.discount,
                HSN_Code: item.productId.HSN_Code,
                'GST Rate': item.productId['GST Rate'],
                Product_Desc: item.productId.Product_Desc,
                Product_MRP: item.productId.Product_MRP,
                MIN_stockalert: item.productId.MIN_stockalert,
                warehouse: item.productId.warehouse,
                SubCategory: item.productId.SubCategory,
                Unit: item.productId.Unit,
                Warehouse_name: item.productId.Warehouse_name,
                createdAt: item.productId.createdAt,
                updatedAt: item.productId.updatedAt,
                unitType: item.unitType,
                transferQty: item.transferQty,
                price: item.price,
                totalPrice: item.totalPrice,
                _id: item._id
            };
        });
        return res.status(200).json(productDetails);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
//-------------------------------------------------------------
export const saveDamageItem1 = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findOne({ _id: req.body.warehouse });
        if (warehouse) {
            const newSubCategory = {
                productId: req.body.productId,
                unitType: req.body.unitType,
                transferQty: req.body.transferQty,
                Size: req.body.Size,
                currentStock: req.body.currentStock,
                price: req.body.price,
                totalPrice: req.body.totalPrice,
                demagePercentage: req.body.demagePercentage,
                reason: req.body.reason,
                typeStatus: req.body.typeStatus
            };

            warehouse.typeStatus = req.body.typeStatus;
            warehouse.damageItem.push(newSubCategory);
            const savedDamageItem = await warehouse.save();
            return res.status(200).json({ message: "damageItem saved successfully", status: true, warehouse: savedDamageItem });
        } else {
            return res.status(404).json({ message: "damageItem not found", status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};

export const saveDamageItem = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findOne({ _id: req.body.warehouse });
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found", status: false });
        }
        const existingProduct = warehouse.productItems.find(item => item.productId.toString() === req.body.productId.toString());

        if (existingProduct) {
            existingProduct.damageItem = {
                productId: req.body.productId,
                unitType: req.body.unitType,
                transferQty: req.body.transferQty,
                size: req.body.size,
                currentStock: req.body.currentStock,
                price: req.body.price,
                totalPrice: req.body.totalPrice,
                damagePercentage: req.body.damagePercentage,
                reason: req.body.reason,
                typeStatus: req.body.typeStatus
            };
            existingProduct.currentStock = req.body.currentStock
            warehouse.typeStatus = req.body.typeStatus;
            const savedWarehouse = await warehouse.save();
            return res.status(200).json({ message: "Damage item saved successfully", status: true, warehouse: savedWarehouse });
        } else {
            return res.status(404).json({ message: "product not found in warehouse", status: false })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const updateDamageItem = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findOne({ _id: req.body.warehouse });
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found", status: false });
        }
        const existingProduct = warehouse.productItems.find(item => item.productId === req.body.productId);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found", status: false });
        }
        existingProduct.damageItem = {
            productId: req.body.productId || existingProduct.damageItem.productId,
            transferQty: req.body.transferQty || existingProduct.damageItem.transferQty,
            currentStock: req.body.currentStock || existingProduct.damageItem.currentStock,
            price: req.body.price || existingProduct.damageItem.price,
            totalPrice: req.body.totalPrice || existingProduct.damageItem.totalPrice,
            damagePercentage: req.body.damagePercentage || existingProduct.damageItem.damagePercentage,
            reason: req.body.reason || existingProduct.damageItem.reason,
            typeStatus: req.body.typeStatus || existingProduct.damageItem.typeStatus,
        };
        existingProduct.currentStock = req.body.currentStock || existingProduct.currentStock
        warehouse.typeStatus = req.body.typeStatus;
        const savedWarehouse = await warehouse.save();
        return res.status(200).json({ message: "Damage item updated successfully", status: true, warehouse: savedWarehouse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const deletedamageItem = async (req, res) => {
    try {
        const { warehouseId, damageItemId } = req.params;
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "warehouse not found", status: false });
        }
        warehouse.damageItem = warehouse.damageItem.filter(sub => sub._id.toString() !== damageItemId);
        const updatedDamageItem = await warehouse.save();
        return res.status(200).json({ message: "damageItem deleted successfully", status: true, warehouse: updatedDamageItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const getDamageItems = async (req, res, next) => {
    try {
        const warehouseId = req.params.id;
        const warehouse = await Warehouse.findOne({ _id: warehouseId })
            .populate({ path: 'damageItem.productId', model: 'product' });
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found", status: false });
        }
        const damageItems = warehouse.damageItem;
        if (!damageItems || damageItems.length === 0) {
            return res.status(404).json({ message: "No damage items found", status: false });
        }
        const resultArray = damageItems.map(item => ({
            warehouse: {
                _id: warehouse._id,
                warehouseName: warehouse.warehouseName,
                // lastName: warehouse.lastName,
                typeStatus: warehouse.typeStatus
            },
            damageItem: {
                productId: {
                    _id: item.productId._id,
                    Product_Title: item.productId.Product_Title,
                },
                _id: item._id,
                unitType: item.unitType,
                transferQty: item.transferQty,
                Size: item.Size,
                currentStock: item.currentStock,
                price: item.price,
                totalPrice: item.totalPrice,
                demagePercentage: item.demagePercentage,
                reason: item.reason,
                typeStatus: item.typeStatus
            },
        }));

        return res.status(200).json({ damageItems: resultArray, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, status: false });
    }
};
export const updateTypeStatus = async (req, res, next) => {
    try {
        const warehouseId = req.params.id;
        const newTypeStatus = req.body.typeStatus;
        const updatedWarehouse = await Warehouse.findOneAndUpdate({ _id: warehouseId });
        if (!updatedWarehouse) {
            return res.status(404).json({ message: "Warehouse not found", status: false });
        }
        const damageItem = updatedWarehouse.damageItem.find(item => item.productId.toString() === req.params.productId);
        if (damageItem) {
            damageItem.typeStatus = newTypeStatus || damageItem.typeStatus,
                damageItem.damagePercentage = req.body.damagePercentage || damageItem.damagePercentage,
                damageItem.reason = req.body.reason || damageItem.reason
            await updatedWarehouse.save();
        }
        return res.status(200).json({ warehouse: updatedWarehouse, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, status: false });
    }
};
//--------------------------------------------------------------------------
export const ViewAllWarehouse = async (req, res, next) => {
    try {
        let array = []
        const ware = await Warehouse.find({}).sort({ sortorder: -1 }).select('_id');
        if (!ware) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        for (let id of ware) {
            let userData = await Warehouse.findById({ _id: id._id }).sort({ sortorder: -1 })
            const { _id, warehouseName, address, mobileNo, landlineNumber, productItems, damageItem, database } = userData
            // const stocks = await ClosingStocks(id._id, productItems)
            const warehouse = {
                warehouseId: _id,
                warehouseName: warehouseName,
                mobileNumber: mobileNo,
                landlineNumber: landlineNumber,
                address: address,
                productItems: productItems,
                damageItem: damageItem,
                database: database,
                closingStatus: "closing"
            }
            if (warehouse) {
                // array.push(warehouse)
                const stock = await Stock.create(warehouse)
            }
        }
        // }
        await deleteModel()
        return res.status(200).json({ message: "data saved successful", status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const viewStockClosingWarehouse = async (req, res, next) => {
    try {
        const warehouse = await Stock.find({ database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "warehouseId", model: "warehouse" })
        return (warehouse.length > 0) ? res.status(200).json({ Warehouse: warehouse, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewOpeningStockWarehouse = async (req, res, next) => {
    try {
        let opening = [];
        const currentDate = new Date();
        const warehouse = await Stock.find({}).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" })
        for (let ware of warehouse) {
            ware.openingStatus = "opening"
            ware.Openingdate = currentDate
            const openingWarehouse = await ware.save();
            opening.push(openingWarehouse)
        }
        return (opening.length > 0) ? res.status(200).json({ Warehouse: opening, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
// my code
export const ViewOverDueStock1 = async (req, res, next) => {
    try {
        const currentDate = moment();
        const startOfLastMonth = currentDate.clone().subtract(30, 'days');
        const productsNotOrderedLastMonth = await Product.find({
            status: "Active",
            createdAt: { $lt: startOfLastMonth.toDate() }
        });
        if (!productsNotOrderedLastMonth || productsNotOrderedLastMonth.length === 0) {
            return res.status(404).json({ message: "No products found", status: false });
        }
        const allOrderedProducts = await CreateOrder.find({ createdAt: { $gte: startOfLastMonth.toDate() } }).distinct('orderItems')
        let allProduct = [];
        for (let item of productsNotOrderedLastMonth) {
            const wasOrderedLastMonth = await allOrderedProducts.find(orderedItem => orderedItem.productId.toString() === item._id.toString());
            if (!wasOrderedLastMonth) {
                const warehouse = await Warehouse.findById(item.warehouse);
                if (warehouse) {
                    const qty = warehouse.productItems.find(item => item.productId.toString() === item._id.toString());
                    if (qty) {
                        let pro = {
                            item: item,
                            Qty: qty.currentStock
                        };
                        allProduct.push(pro);
                    } else {
                        allProduct.push(item);
                        console.error(`Product with ID ${item._id} not found in warehouse`);
                    }
                } else {
                    console.error(`Warehouse with ID ${item.warehouse} not found`);
                }
            }
        }
        return res.status(200).json({ allProduct, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const ViewOverDueStock = async (req, res, next) => {
    try {
        const currentDate = moment();
        const startOfLastMonth = currentDate.clone().subtract(30, 'days');
        const productsNotOrderedLastMonth = await Product.find({ status: "Active", createdAt: { $lt: startOfLastMonth.toDate() } }).populate({ path: "partyId", model: "customer" });

        if (!productsNotOrderedLastMonth || productsNotOrderedLastMonth.length === 0) {
            return res.status(404).json({ message: "No products found", status: false });
        }
        const orderedProductsLastMonth = await CreateOrder.find({
            createdAt: { $gte: startOfLastMonth.toDate() }
        }).distinct('orderItems');
        const orderedProductIdsLastMonth = orderedProductsLastMonth.map(orderItem => orderItem.productId.toString());
        const productsToProcess = productsNotOrderedLastMonth.filter(product =>
            !orderedProductIdsLastMonth.includes(product._id.toString())
        );
        const warehouseIds = productsToProcess.map(product => product.warehouse);
        const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } });
        const allProduct = productsToProcess.map(product => {
            const warehouse = warehouses.find(warehouse => warehouse._id.toString() === product.warehouse.toString());
            const qty = warehouse ? warehouse.productItems.find(item => item.productId.toString() === product._id.toString()) : null;
            return {
                product,
                Qty: qty ? qty.currentStock : null
            };
        });

        return res.status(200).json({ allProduct, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};


export const ViewDeadParty1 = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const currentDate = moment();
        const startOfLastMonth = currentDate.clone().subtract(30, 'days');

        const hierarchy = await Customer.find({ database: database, status: 'Active', createdAt: { $lt: startOfLastMonth } })

        const allOrderedParties = await CreateOrder.find({ database: database, createdAt: { $gte: startOfLastMonth.toDate() } })
        let allParty = []
        let result = []
        for (let item of hierarchy) {
            const party = allOrderedParties.find((items) => items.partyId.toString() === item._id.toString())
            if (!party) {
                allParty.push(item)
            }
        }
        let lastDays = ""
        for (let id of allParty) {
            const payment = await Receipt.find({ type: "receipt", partyId: id._id })
            if (payment.length > 0) {
                const lastPayment = payment[payment.length - 1]
                lastDays = lastPayment.createdAt;
            } else {
                lastDays = "0"
            }
            const party = await partyHierarchy(id.created_by, database);
            const resultItem = { id, party, lastDays };
            result.push(resultItem);
        }
        return res.status(200).json({ Parties: result, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewDeadParty = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const currentDate = moment();
        const startOfLastMonth = currentDate.clone().subtract(30, 'days');

        const hierarchy = await Customer.find({ database: database, status: 'Active', createdAt: { $lt: startOfLastMonth } }).lean();

        const allOrderedParties = await CreateOrder.find({ database: database, createdAt: { $gte: startOfLastMonth.toDate() } }).lean();

        const receiptMap = {};
        await Promise.all(hierarchy.map(async (item) => {
            const payment = await Receipt.findOne({ type: "receipt", partyId: item._id }).sort({ createdAt: -1 }).lean();
            receiptMap[item._id] = payment ? payment.createdAt : "0";
        }));

        const result = await Promise.all(hierarchy.map(async (item) => {
            const party = await partyHierarchy(item.created_by, database);
            return { id: item, party: party, lastDays: receiptMap[item._id] };
        }));

        return res.status(200).json({ Parties: result, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const partyHierarchy = async function partyHierarchy(userId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(userId)) {
            return [];
        }
        processedIds.add(userId);
        const user = await User.findOne({ _id: userId, database: `${database}` }).lean();
        if (!user) {
            return [];
        }
        const createdByUserId = user.created_by;
        if (!createdByUserId) {
            return [user];
        }
        const parentResults = await partyHierarchy(createdByUserId, database, processedIds);
        return [user, ...parentResults];
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};


export const ViewAllWarehouse1 = async (req, res, next) => {
    try {
        let array = []
        const ware = await Warehouse.find({}).sort({ sortorder: -1 }).select('_id');
        if (!ware) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        for (let id of ware) {
            let userData = await Warehouse.findById({ _id: id._id }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "damageItem.productId", model: "product" })
            const { _id, warehouseName, address, mobileNo, landlineNumber, productItems, damageItem, database } = userData
            const stocks = await ClosingStocks(id._id, productItems)
            const warehouse = {
                warehouseId: _id,
                warehouseName: warehouseName,
                mobileNumber: mobileNo,
                landlineNumber: landlineNumber,
                address: address,
                productItems: stocks,
                damageItem: damageItem,
                database: database,
                closingStatus: "closing"
            }
            if (warehouse) {
                const stock = await Stock.create(warehouse)
            }
        }
        // }
        return res.status(200).json({ message: "data saved successful", status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ClosingStocks = async (warehouse, productItem) => {
    try {
        const gstDetails = [];
        let cgstRate = 0;
        let igstRate = 0;
        let tax = 0
        let pQty = 0;
        let pBAmount = 0
        let pTaxAmount = 0
        let pTotal = 0
        let sQty = 0;
        let sBAmount = 0
        let sTaxAmount = 0
        let sTotal = 0
        for (let item of productItem) {
            const stock = await ClosingStock.findOne({ warehouseId1: warehouse, productId: item.productId })
            if (stock) {
                pQty = stock.pQty || 0;
                pBAmount = stock.pBAmount || 0
                pTaxAmount = stock.pTaxAmount || 0
                pTotal = stock.pTotal || 0
                sQty = stock.sQty || 0;
                sBAmount = stock.sBAmount || 0
                sTaxAmount = stock.sTaxAmount || 0
                sTotal = stock.sTotal || 0
            }
            const rate = item.gstPercentage / 2;
            if (item.igstTaxType === false) {
                cgstRate = ((item.currentStock * item.price) * rate) / 100;
                tax = cgstRate * 2
            } else {
                igstRate = ((item.currentStock * item.price) * item.gstPercentage) / 100;
                tax = igstRate
            }
            const gst = {
                productId: item.productId._id,
                unitType: item.unitType,
                Size: item.Size,
                currentStock: item.currentStock,
                transferQty: item.transferQty,
                price: item.price,
                totalPrice: item.totalPrice,
                pendingStock: item.pendingStock,
                igstTaxType: item.igstTaxType,
                gstPercentage: item.gstPercentage,
                damageItem: item.damageItem,
                cQty: item.currentStock || 0,
                cBAmount: item.totalPrice || 0,
                cTaxAmount: tax || 0,
                cTotal: (item.totalPrice + tax) || 0,
                pQty: pQty || 0,
                pBAmount: pBAmount || 0,
                pTaxAmount: pTaxAmount || 0,
                pTotal: pTotal || 0,
                sQty: sQty || 0,
                sBAmount: sBAmount || 0,
                sTaxAmount: sTaxAmount || 0,
                sTotal: sTotal || 0

            };
            gstDetails.push(gst);
        }
        return gstDetails;
    }
    catch (err) {
        console.log(err)
    }
}
export const deleteModel = async () => {
    try {
        await ClosingStock.deleteMany({});
        return true
    } catch (error) {
        console.error('Error deleting data:', error);
    }
}