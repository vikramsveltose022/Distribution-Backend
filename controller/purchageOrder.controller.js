import { InvoiceList } from "../model/createInvoice.model.js";
import { Product } from "../model/product.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { User } from "../model/user.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";
import { generateInvoice } from "../service/invoice.js";
import { addProductInWarehouse } from "./product.controller.js";

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
        const purchaseOrder = await PurchaseOrder.find({ database: database }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).exec();
        return purchaseOrder ? res.status(200).json({ orderHistory: purchaseOrder, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false });
    }
};
// export const updatePurchaseOrderStatus = async (req, res) => {
//     try {
//         const orderId = req.params.id;
//         const { status, paymentMode } = req.body;
//         const order = await PurchaseOrder.findById({ _id: orderId });
//         if (!order) {
//             return res.status(404).json({ message: 'Purchase order not found' });
//         }
//         if (status) {
//             order.status = status;
//         }
//         if (paymentMode) {
//             order.paymentMode = paymentMode
//         }
//         await order.save();
//         return res.status(200).json({ Order: order, status: true });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: error, status: false });
//     }
// }
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
                        //     product.Size -= quantityChange;
                        product.basicPrice = await newOrderItem.basicPrice;
                        product.landedCost = await newOrderItem.landedCost;
                        await product.save();
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
        const targetQuery = { database: req.params.database };
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
            const key = orderItem.productId._id.toString() + orderItem.HSN_Code;
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
