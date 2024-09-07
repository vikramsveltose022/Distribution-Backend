import moment from "moment";
import { ClosingStock } from "../model/closingStock.model.js";
import { Ledger } from "../model/ledger.model.js";
import { Product } from "../model/product.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { User } from "../model/user.model.js";
import { Warehouse } from "../model/warehouse.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";
import { generateInvoice } from "../service/invoice.js";
import { addProductInWarehouse } from "./product.controller.js";
import { Receipt } from "../model/receipt.model.js";
import { CustomerGroup } from "../model/customerGroup.model.js";

export const purchaseOrder = async (req, res, next) => {
    try {
        const orderItems = req.body.orderItems;
        const user = await User.findOne({ _id: req.body.userId });
        if (!user) {
            return res.status(401).json({ message: "No user found", status: false });
        } else {
            const result = await generateInvoice(user.database);
            if (!result) {
                return res.status(404).json({ message: "InvoiceNo. Not Set", status: false })
            }
            const billAmount = orderItems.reduce((total, orderItem) => {
                return total + (orderItem.price * orderItem.qty);
            }, 0);
            for (const orderItem of orderItems) {
                const product = await Product.findOne({ _id: orderItem.productId });
                if (product) {
                    // product.purchaseDate = new Date()
                    // product.partyId = req.body.partyId;
                    // product.purchaseStatus = true
                    // product.basicPrice = await orderItem.basicPrice;
                    // product.landedCost = await orderItem.landedCost;
                    // await product.save();
                    // console.log(await product.save())
                    // const warehouse = { productId: orderItem.productId, unitType: orderItem.unitType, currentStock: orderItem.qty, transferQty: orderItem.qty, price: orderItem.price, totalPrice: orderItem.totalPrice, Size: orderItem.Size }
                    // await addProductInWarehouse(warehouse, product.warehouse)
                } else {
                    return res.status(404).json(`Product with ID ${orderItem.productId} not found`);
                }
            }
            req.body.userId = user._id;
            req.body.database = user.database;
            req.body.invoiceId = result
            const order = await PurchaseOrder.create(req.body)
            return order ? res.status(200).json({ orderDetail: order, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false })
    }
};
export const PurchaseOrderDispatch = async (req, res, next) => {
    try {
        const Checked = []
        const order = await PurchaseOrder.findById({ _id: req.params.id });
        if (!order) {
            return res.status(401).json({ message: "Purchase Order Not Found", status: false });
        } else {
            for (const orderItem of order.orderItems) {
                for (let item of req.body.DispatchItem) {
                    if (item.productId.toString() === orderItem.productId.toString()) {
                        orderItem.ReceiveQty = item.ReceiveQty
                        orderItem.DamageQty = item.DamageQty
                        orderItem.status = "Received"
                        order.status = "Received"
                    } else {
                        if (orderItem.status === "Received") {
                            order.status = "Received"
                        } else {
                            Checked.push(item)
                            // order.status = "pending"
                        }
                    }
                }
            }
            if (Checked.length !== 0) {
                order.status = "pending"
            }
            order.NoOfPackage += req.body.NoOfPackage;
            const updatedOrder = order.save()
            return updatedOrder ? res.status(200).json({ message: "Updated Successfull!", orderDetail: updatedOrder, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
};
export const purchaseOrderHistoryByOrderId = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const orders = await PurchaseOrder.findById({ _id: orderId }).populate({
            path: 'userId',
            model: 'user'
        }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).exec();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for the user", status: false });
        }
        return res.status(200).json({ orderHistory: orders, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};
export const purchaseOrderHistory = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Product Not Found", status: false })
        // }
        const purchaseOrder = await PurchaseOrder.find({ database: database, status: { $ne: "Deactive" } }).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).exec();
        return purchaseOrder ? res.status(200).json({ orderHistory: purchaseOrder, status: true }) : res.status(404).json({ message: "Purchase Order Not Found", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, paymentMode } = req.body;
        const order = await PurchaseOrder.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (status || paymentMode) {
            Object.assign(order, {
                status: status || order.status,
                paymentMode: paymentMode || order.paymentMode,
            });
            await order.save();
        }
        return res.status(200).json({ Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: false });
    }
};

export const updatePurchaseOrder = async (req, res, next) => {
    try {
        let groupDiscount = 0;
        const orderId = req.params.id;
        // req.body.orderItem = req.body.orderItems
        const updatedFields = req.body;
        if (!orderId || !updatedFields) {
            return res.status(400).json({ message: "Invalid input data", status: false });
        }
        const order = await PurchaseOrder.findById({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: "Order not found", status: false });
        }
        else if (order.status === 'completed')
            return res.status(400).json({ message: "this order not updated", status: false })
        const oldOrderItems = order.orderItems || [];
        const newOrderItems = updatedFields.orderItems || [];
        for (const newOrderItem of newOrderItems) {
            // const oldOrderItem = oldOrderItems.find(item => item.productId.toString() === newOrderItem.productId.toString());
            // if (oldOrderItem) {
            // const quantityChange = newOrderItem.qty - oldOrderItem.qty;
            // if (quantityChange !== 0) {
            const product = await Product.findById({ _id: newOrderItem.productId });
            if (product) {
                const group = await CustomerGroup.find({ database: req.body.database, status: "Active" })
                if (group.length > 0) {
                    const maxDiscount = group.reduce((max, group) => {
                        return group.discount > max.discount ? group : max;
                    });
                    groupDiscount = maxDiscount.discount;
                }
                //     product.Size -= quantityChange;

                //change this line to -------------------
                product.basicPrice = await newOrderItem.basicPrice;
                product.landedCost = await newOrderItem.landedCost;
                product.Purchase_Rate = await newOrderItem.landedCost;
                if (!product.ProfitPercentage || product.ProfitPercentage === 0) {
                    product.SalesRate = product.Purchase_Rate * 1.03;
                    product.Product_MRP = (product.SalesRate) * ((100 + product.GSTRate) / 100) * ((100 + groupDiscount) / 100);
                } else {

                    product.SalesRate = (product.Purchase_Rate * (100 + product.ProfitPercentage)) / 100;
                    product.Product_MRP = (product.SalesRate * ((100 + product.GSTRate) / 100) * ((100 + groupDiscount) / 100));
                }
                // console.log("SalesRate", product.SalesRate, "Product_MRP", product.Product_MRP, "landedCost", product.landedCost, "Purchase_Rate", product.Purchase_Rate, "groupDiscount", groupDiscount, "GSTRate", product.GSTRate, "ProfitPercentage", product.ProfitPercentage);
                await product.save();
                // console.log("product", product);
                //this line ---------------------

                // product.basicPrice = await newOrderItem.basicPrice;
                // product.landedCost = await newOrderItem.landedCost;
                // await product.save();
            } else {
                console.error(`Product with ID ${newOrderItem.productId} not found`);
            }
            // }
            // }
        }
        Object.assign(order, updatedFields);
        const updatedOrder = await order.save();
        return res.status(200).json({ orderDetail: updatedOrder, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const ProductWisePurchaseReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database, status: { $ne: "Deactive" } };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let orders = [];
        const salesOrder = await PurchaseOrder.find(targetQuery).populate({ path: "orderItems.productId", model: "product" });
        if (salesOrder.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        for (let order of salesOrder) {
            orders = orders.concat(order.orderItems);
        }
        const uniqueOrdersMap = new Map();
        for (let orderItem of orders) {
            const key = orderItem?.productId?._id.toString() + orderItem.HSN_Code;
            if (uniqueOrdersMap.has(key)) {
                const existingOrder = uniqueOrdersMap.get(key);
                existingOrder.taxableAmount += orderItem.taxableAmount;
                existingOrder.cgstRate += orderItem.cgstRate;
                existingOrder.qty += orderItem.qty;
                existingOrder.Size += orderItem.Size;
                existingOrder.sgstRate += orderItem.sgstRate;
                existingOrder.igstRate += orderItem.igstRate;
                existingOrder.grandTotal += orderItem.grandTotal;
            } else {
                uniqueOrdersMap.set(key, { ...orderItem.toObject() });
            }
        }
        const uniqueOrders = Array.from(uniqueOrdersMap.values());
        return res.status(200).json({ Orders: uniqueOrders, status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const deletePurchaseOrder = async (req, res, next) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id)
        if (!order) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        if (order.status === "completed") {
            return res.status(400).json({ message: "this order not deleted", status: false });
        }
        order.status = "Deactive";
        await order.save();
        return res.status(200).json({ message: "delete successfull!", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

// delete purchaseOrder after status completed
export const deletedPurchase = async (req, res, next) => {
    try {
        const purchase = await PurchaseOrder.findById(req.params.id)
        if (!purchase) {
            return res.status(404).json({ message: "PurchaseOrder Not Found", status: false })
        }
        for (const orderItem of purchase.orderItems) {
            const product = await Product.findOne({ _id: orderItem.productId });
            if (product) {
                // const current = new Date(new Date())
                // product.purchaseDate = current
                // product.partyId = req.body.partyId;
                // product.purchaseStatus = true
                // product.landedCost = orderItem.landedCost;
                product.qty -= orderItem.qty;
                product.pendingQty += orderItem.qty;
                const warehouse = { productId: orderItem.productId, currentStock: (orderItem.qty), transferQty: (orderItem.qty), price: orderItem.price, totalPrice: orderItem.totalPrice, gstPercentage: orderItem.gstPercentage, igstTaxType: orderItem.igstTaxType, primaryUnit: orderItem.primaryUnit, secondaryUnit: orderItem.secondaryUnit, secondarySize: orderItem.secondarySize, landedCost: orderItem.landedCost }
                await product.save();
                await deleteAddProductInWarehouse(warehouse, product.warehouse)
                await DeleteClosingPurchase(orderItem, product.warehouse)
            } else {
                console.log("Product Id Not Found")
                // return res.status(404).json(`Product with ID ${orderItem.productId} not found`);
            }
        }
        purchase.status = "Deactive"
        await purchase.save()
        await Ledger.findOneAndDelete({ orderId: req.params.id })
        return res.status(200).json({ message: "delete successfull!", status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteAddProductInWarehouse = async (warehouse, warehouseId) => {
    try {
        const user = await Warehouse.findById(warehouseId);
        if (!user) {
            // return console.log("warehouse not found");
        }
        const sourceProductItem = user.productItems.find((pItem) => pItem.productId.toString() === warehouse.productId.toString());
        if (sourceProductItem) {
            sourceProductItem.currentStock -= warehouse.transferQty;
            sourceProductItem.totalPrice -= warehouse.totalPrice;
            sourceProductItem.transferQty -= warehouse.transferQty;
            if (sourceProductItem.currentStock <= 0) {
                user.productItems = user.productItems.filter((pItem) => pItem.productId.toString() !== warehouse.productId._id.toString());
            }
            // console.log("warehouse : " + sourceProductItem)
            user.markModified('productItems');
            await user.save();
        } else {
            console.log("Product item not found in the warehouse");
        }
    } catch (error) {
        console.error(error);
    }
};
export const DeleteClosingPurchase = async (orderItem, warehouse) => {
    try {
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;
        let tax = 0
        const rate = parseInt(orderItem.gstPercentage) / 2;
        if (orderItem.igstTaxType === false) {
            cgstRate = (((orderItem.qty) * orderItem.price) * rate) / 100;
            sgstRate = (((orderItem.qty) * orderItem.price) * rate) / 100;
            tax = cgstRate + sgstRate
        } else {
            igstRate = (((orderItem.qty) * orderItem.price) * parseInt(orderItem.gstPercentage)) / 100;
            tax = igstRate
        }
        const stock = await ClosingStock.findOne({ warehouseId1: warehouse, productId: orderItem.productId })
        if (stock) {
            stock.pQty -= (orderItem.qty);
            stock.pBAmount -= orderItem.totalPrice;
            stock.pTaxRate -= tax;
            stock.pTotal -= (orderItem.totalPrice + tax)
            // console.log("stock : " + stock)
            await stock.save()
        } else {
            console.log("product item not found in stock")
        }
        return true
    }
    catch (err) {
        console.log(err)
    }
}

// For DashBoard
export const CreditorCalculate11 = async (req, res, next) => {
    try {
        let Creditor = {
            totalPurchase: 0,
            totalPaid: 0,
            currentPurchase: 0,
            currentPaid: 0,
            outstanding: 0
        };
        // const startOfDay = moment().startOf('day').toDate();
        // const endOfDay = moment().endOf('day').toDate();
        const startOfDay = moment().startOf('month').toDate();
        const endOfDay = moment().endOf('month').toDate();
        const purchase = await PurchaseOrder.find({ database: req.params.database, status: "completed" }).sort({ sortorder: -1 })
        if (purchase.length === 0) {
            // return res.status(404).json({ message: "Purchase Order Not Found", status: false })
        }
        const purchaseCurrentMonth = await PurchaseOrder.find({
            database: req.params.database,
            status: "completed",
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ sortorder: -1 });
        if (purchaseCurrentMonth.length === 0) {
            // return res.status(404).json({ message: "Purchase Order Not Found", status: false })
        }
        const receipt = await Receipt.find({ database: req.params.database, type: "payment", status: "Active" }).sort({ sortorder: -1 })
        if (receipt.length === 0) {
            // return res.status(404).json({ message: "Purchase Order Not Found", status: false })
        }
        const receipts = await Receipt.find({ database: req.params.database, type: "payment", createdAt: { $gte: startOfDay, $lte: endOfDay }, status: "Active" }).sort({ sortorder: -1 })
        if (receipts.length === 0) {
            // return res.status(404).json({ message: "Purchase Order Not Found", status: false })
        }
        purchase.forEach(item => {
            Creditor.totalPurchase += item.grandTotal
        })
        purchaseCurrentMonth.forEach(item => {
            Creditor.currentPurchase += item.grandTotal
        })
        receipt.forEach(item => {
            Creditor.totalPaid += item.amount
        })
        receipts.forEach(item => {
            Creditor.currentPaid += item.amount
        })
        Creditor.outstanding = Creditor.totalPurchase - Creditor.totalPaid
        res.status(200).json({ Creditor, status: true });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const CreditorCalculate = async (req, res, next) => {
    try {
        let Creditor = {
            totalPurchase: 0,
            totalPaid: 0,
            currentPurchase: 0,
            currentPaid: 0,
            outstanding: 0
        };
        // const startOfDay = moment().startOf('day').toDate();
        // const endOfDay = moment().endOf('day').toDate();
        const startOfDay = moment().startOf('month').toDate();
        const endOfDay = moment().endOf('month').toDate();
        // Fetch all necessary data in parallel
        const [purchase, purchaseCurrentMonth, receipt, receipts] = await Promise.all([
            PurchaseOrder.find({ database: req.params.database, status: "completed" }).sort({ sortorder: -1 }),
            PurchaseOrder.find({ database: req.params.database, status: "completed", createdAt: { $gte: startOfDay, $lte: endOfDay } }).sort({ sortorder: -1 }),
            Receipt.find({ database: req.params.database, type: "payment", status: "Active" }).sort({ sortorder: -1 }),
            Receipt.find({ database: req.params.database, type: "payment", createdAt: { $gte: startOfDay, $lte: endOfDay }, status: "Active" }).sort({ sortorder: -1 })
        ]);

        // Calculate totals
        Creditor.totalPurchase = purchase.reduce((sum, item) => sum + item.grandTotal, 0);
        Creditor.currentPurchase = purchaseCurrentMonth.reduce((sum, item) => sum + item.grandTotal, 0);
        Creditor.totalPaid = receipt.reduce((sum, item) => sum + item.amount, 0);
        Creditor.currentPaid = receipts.reduce((sum, item) => sum + item.amount, 0);
        // Creditor.outstanding = Creditor.totalPurchase - Creditor.totalPaid;

        res.status(200).json({ Creditor, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
