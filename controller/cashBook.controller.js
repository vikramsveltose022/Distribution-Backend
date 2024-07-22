import axios from "axios";
import { CashBook } from "../model/cashBookOrder.model.js";
import { Product } from "../model/product.model.js";
import { User } from "../model/user.model.js";
import { findUserDetails } from "../rolePermission/permission.js";
import { Order } from "../model/order.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { Warehouse } from "../model/warehouse.model.js";
import { Customer } from "../model/customer.model.js";
import { ledgerPartyForCredit, ledgerSalesForDebit } from "../service/ledger.js";

export const cashBookOrder = async (req, res, next) => {
    try {
        let ware = ""
        let particular = "CashOrder"
        const orderItems = req.body.orderItems;
        const user = await Customer.findOne({ _id: req.body.partyId });
        if (!user) {
            return res.status(401).json({ message: "Party Not Found", status: false });
        } else {
            const billAmount = orderItems.reduce((total, orderItem) => {
                return total + (orderItem.price * orderItem.qty);
            }, 0);
            for (const orderItem of orderItems) {
                const product = await Product.findById({ _id: orderItem.productId });
                if (product) {
                    ware = product.warehouse
                    product.salesDate = new Date()
                    const warehouse = await Warehouse.findById(product.warehouse)
                    if (warehouse) {
                        const pro = warehouse.productItems.find((item) => item.productId === orderItem.productId)
                        pro.currentStock -= (orderItem.Size * orderItem.qty);
                        await warehouse.save();
                        await product.save()
                    }
                } else {
                    console.error(`Product with ID ${orderItem.productId} not found`);
                }
            }
            req.body.userId = user.created_by
            req.body.database = user.database
            req.body.orderItems = orderItems
            req.body.warehouseId = ware       
            const savedOrder = await CashBook.create(req.body)
            req.body.userId = user.created_by
            if (savedOrder) {
                await ledgerSalesForDebit(req.body, particular)
                await ledgerPartyForCredit(req.body, particular)
            }
            return res.status(200).json({ CashBook: savedOrder, status: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};
export const placeOrderHistoryByUserId = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const orders = await CashBook.find({ userId: userId }).populate({
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
export const updatePlaceOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        req.body.orderItems = req.body.orderItems
        const updatedFields = req.body;
        if (!orderId || !updatedFields) {
            return res.status(400).json({ message: "Invalid input data", status: false });
        }
        const order = await CashBook.findById({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: "Order not found", status: false });
        }
        else if (order.status === 'completed')
            return res.status(400).json({ message: "this order not updated", status: false })
        const oldOrderItems = order.orderItems || [];
        const newOrderItems = updatedFields.orderItems || [];
        for (const newOrderItem of newOrderItems) {
            const oldOrderItem = oldOrderItems.find(item => item.productId.toString() === newOrderItem.productId.toString());
            if (oldOrderItem) {
                const quantityChange = newOrderItem.qty - oldOrderItem.qty;
                if (quantityChange !== 0) {
                    const product = await Product.findById({ _id: newOrderItem.productId });
                    if (product) {
                        const warehouse = await Warehouse.findById({ _id: product.warehouse })
                        if (warehouse) {
                            const pro = warehouse.productItems.find((item) => item.productId === newOrderItem.productId)
                            pro.currentStock -= (newOrderItem.Size * quantityChange);
                            await warehouse.save();
                        }
                    } else {
                        console.error(`Product with ID ${newOrderItem.productId} not found`);
                    }
                }
            }
        }
        Object.assign(order, updatedFields);
        const updatedOrder = await order.save();
        return res.status(200).json({ orderDetail: updatedOrder, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
export const updateCashBookOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { paymentMode } = req.body;
        const order = await CashBook.findById({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: 'Place order not found' });
        }
        order.paymentMode = paymentMode;
        await order.save();
        return res.status(200).json({ Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}

export const OrderHistory1 = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const userHierarchy = await findUserDetails(userId);
        const orderTypes = [
            { model: CashBook, name: 'CashBook' },
            { model: Order, name: 'Order' },
            { model: CreateOrder, name: 'CreateOrder' }
        ];
        const orderPromises = userHierarchy.map(async user => {
            const userOrders = await Promise.all(orderTypes.map(async orderType => {
                const orders = await orderType.model.find({ userId: user._id })
                    .populate({
                        path: 'orderItems.productId',
                        model: 'product'
                    })
                    .populate({
                        path: "userId",
                        model: "user"
                    })
                    .exec();

                return formatOrders(orders, user, req);
            }));

            return [].concat(...userOrders);
        });
        const allOrders = await Promise.all(orderPromises);
        const flattenedOrders = [].concat(...allOrders);
        if (flattenedOrders.length === 0) {
            return res.status(404).json({ message: "No orders found", status: false });
        }
        return res.status(200).json({ Orders: flattenedOrders, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

const formatOrders = (orders, adminDetail, req) => {
    return orders.map(order => ({
        _id: order._id,
        userId: order.userId,
        partyId: order.partyId,
        fullName: order.fullName,
        address: order.address,
        MobileNo: order.MobileNo,
        country: order.country,
        state: order.state,
        city: order.city,
        landMark: order.landMark,
        pincode: order.pincode,
        grandTotal: order.grandTotal,
        discount: order.discount,
        shippingCost: order.shippingCost,
        taxAmount: order.taxAmount,
        status: order.status,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        currentAddress: req.body.currentAddress,
        paymentMode: order.paymentMode,
        cashBookType: order.cashBookType,
        orderItems: order.orderItems.map(item => ({
            product: item.productId,
            qty: item.qty,
            Size: item.Size,
            unitType: item.unitType,
            price: item.price,
            status: item.status
        })),
        adminDetail,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    }));
};

export const OrderHistory = async (req, res, next) => {
    try {
        const database = req.params.database;
        const order = await CashBook.find({ database: database }).sort({ sortorder: -1 }).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" }).exec();
        return (order.length > 0) ? res.status(200).json({ Orders: order, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}