import dotenv from "dotenv";
import axios from "axios";
import path from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs"
import pdf from 'html-pdf'
import { Order } from "../model/order.model.js";
import { User } from "../model/user.model.js";
import { Product } from "../model/product.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { generateInvoice } from "../service/invoice.js";
import { getCreateOrderHierarchy, getOrderHierarchy, getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";
import { Customer } from "../model/customer.model.js";
import { createInvoiceTemplate } from "../Invoice/invoice.js";
import transporter from "../service/email.js";
import { Warehouse } from "../model/warehouse.model.js";
import { checkLimit } from "../service/checkLimit.js";
import { PartyOrderLimit } from "../model/partyOrderLimit.model.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const OrderXml = async (req, res) => {
    const fileUrl = "https://xmlfile.blr1.cdn.digitaloceanspaces.com/CreateCustomerConfig.xml";
    try {
        const response = await axios.get(fileUrl);
        const data = response.data;
        return res.status(200).json({ data, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error reading the file");
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        const orderItems = req.body.orderItems;
        const user = await User.findOne({ _id: req.body.userId });
        if (!user) {
            return res.status(401).json({ message: "No user found", status: false });
        } else {
            const result = await generateInvoice(user.database);
            const billAmount = orderItems.reduce((total, orderItem) => {
                return total + (orderItem.price * orderItem.qty);
            }, 0);
            for (const orderItem of orderItems) {
                const product = await Product.findOne({ _id: orderItem.productId });
                if (product) {
                    const warehouse = User.findById({ _id: product.warehouse })
                    if (warehouse) {
                        const pro = warehouse.productItems.find((item) => item.productId === orderItem.productId)
                        pro.currentStock -= (orderItem.Size * orderItem.qty);
                        await warehouse.save();
                    }
                } else {
                    console.error(`Product with ID ${orderItem.productId} not found`);
                }
            }
            const order = new Order({
                userId: user._id,
                database: user.database,
                fullName: req.body.fullName,
                partyId: req.body.partyId,
                invoiceId: result,
                address: req.body.address,
                MobileNo: req.body.MobileNo,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                landMark: req.body.landMark,
                pincode: req.body.pincode,
                grandTotal: req.body.grandTotal,
                discount: req.body.discount,
                shippingCost: req.body.shippingCost,
                taxAmount: req.body.taxAmount,
                status: req.body.status,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                currentAddress: req.body.currentAddress,
                orderItems: orderItems
            });
            const savedOrder = await order.save();
            return res.status(200).json({ orderDetail: savedOrder, status: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};
export const placeOrderHistoryByUserId = async (req, res, next) => {
    try {
        const userId = req.params.id;
        // const userHierarchy = await findUserDetails(userId);
        // const adminDetail = (userHierarchy[userHierarchy.length - 1])
        const orders = await Order.find({ userId: userId }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).exec();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for the user", status: false });
        }
        const formattedOrders = orders.map(order => {
            const formattedOrderItems = order.orderItems.map(item => ({
                product: item.productId,
                qty: item.qty,
                Size: item.Size,
                unitType: item.unitType,
                price: item.price,
                status: item.status
            }));
            return {
                _id: order._id,
                userId: order.userId,
                partyId: order.partyId,
                invoiceId: order.invoiceId,
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
                orderItems: formattedOrderItems,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                currentAddress: req.body.currentAddress,
                status: order.status,
                // adminDetail: adminDetail,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });
        return res.status(200).json({ orderHistory: formattedOrders, status: true });
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
        const order = await Order.findById({ _id: orderId });
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
                        product.Size -= quantityChange;
                        await product.save();
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
export const updatePlaceOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const order = await Order.findById({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: 'Place order not found' });
        }
        order.status = status;
        await order.save();
        // if (status === 'completed') {
        //     req.body.totalAmount = order.grandTotal;
        //     req.body.productItems = order.orderItem;
        //     req.body.userId = order.userId;
        //     req.body.orderId = order._id;
        //     await CreditNote.create(req.body)
        // }
        return res.status(200).json({ Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}

export const createOrder = async (req, res, next) => {
    try {
        let ware = ""
        const { partyId, userId, orderId } = req.body;
        const orderItems = req.body.orderItems;
        const party = await Customer.findById({ _id: partyId })
        const user = await User.findOne({ _id: party.created_by });
        if (!user) {
            return res.status(401).json({ message: "No user found", status: false });
        } else {
            const result = await generateInvoice(user.database);
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
                        pro.currentStock -= (orderItem.qty);
                        product.Opening_Stock -= orderItem.qty;
                        if (pro.currentStock < 0) {
                            return res.status(404).json({ message: "out of stock", status: false })
                        }
                        await warehouse.save();
                        await product.save()
                    }
                } else {
                    console.error(`Product with ID ${orderItem.productId} not found`);
                }
            }
            const order = new CreateOrder({
                userId: party.created_by,
                database: user.database,
                fullName: req.body.fullName,
                partyId: req.body.partyId,
                warehouseId: ware,
                primaryUnit: req.body.primaryUnit,
                secondaryUnit: req.body.secondaryUnit,
                secondarySize: req.body.secondarySize,
                invoiceId: result,
                address: req.body.address,
                MobileNo: req.body.MobileNo,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                landMark: req.body.landMark,
                pincode: req.body.pincode,
                grandTotal: req.body.grandTotal,
                discount: req.body.discount,
                shippingCost: req.body.shippingCost,
                taxAmount: req.body.taxAmount,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                currentAddress: req.body.currentAddress,
                status: req.body.status,
                orderItems: orderItems,
                gstDetails: req.body.gstDetails,
                roundOff: req.body.roundOff,
                amount: req.body.amount,
                sgstTotal: req.body.sgstTotal,
                cgstTotal: req.body.cgstTotal,
                igstTaxType: req.body.igstTaxType,
                igstTotal: req.body.igstTotal,
                discountAmount: req.body.discountAmount
            });
            const savedOrder = await order.save();
            req.body.database = user.database;
            req.body.totalAmount = req.body.grandTotal;
            req.body.orderId = savedOrder._id;
            await checkLimit(req.body)
            return res.status(200).json({ orderDetail: savedOrder, status: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};
export const createOrderHistoryByUserId = async (req, res, next) => {
    try {
        const userId = req.params.id;
        // const userHierarchy = await findUserDetails(userId);
        // const adminDetail = (userHierarchy[userHierarchy.length - 1])
        const orders = await CreateOrder.find({ userId: userId }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).exec();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for the user", status: false });
        }
        const formattedOrders = orders.map(order => {
            const formattedOrderItems = order.orderItems.map(item => ({
                product: item.productId,
                qty: item.qty,
                Size: item.Size,
                unitType: item.unitType,
                price: item.price,
                status: item.status
            }));
            return {
                _id: order._id,
                userId: order.userId,
                fullName: order.fullName,
                partyId: order.partyId,
                invoiceId: order.invoiceId,
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
                orderItems: formattedOrderItems,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                currentAddress: req.body.currentAddress,
                status: order.status,
                // adminDetail: adminDetail,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });
        return res.status(200).json({ orderHistory: formattedOrders, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};
export const createOrderHistoryById = async (req, res, next) => {
    try {
        const orders = await CreateOrder.findById(req.params.id).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: "partyId", model: "customer" }).exec();
        return res.status(200).json({ orderHistory: orders, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};

export const deleteSalesOrder = async (req, res, next) => {
    try {
        const order = await CreateOrder.findById(req.params.id)
        if (!order) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        if (order.status === "completed") {
            return res.status(400).json({ error: "this order not deleted", status: false });
        }
        order.status = "Deactive";
        await order.save();
        return res.status(200).json({ message: "delete successfull!", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

// export const createOrderHistoryByPartyId = async (req, res, next) => {
//     try {
//         const orders = await CreateOrder.findById(req.params.id).populate({
//             path: 'orderItems.productId',
//             model: 'product'
//         }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).exec();
//         if (!orders) {
//             return res.status(404).json({ message: "No orders found for the user", status: false });
//         }
//         const party = await Customer.findById(orders.partyId._id).populate({ path: 'category', model: "customerGroup" })
//         return res.status(200).json({ orderHistory: { ...orders.toObject(), party, partyId: undefined }, status: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ error: err });
//     }
// };

export const createOrderHistoryByPartyId = async (req, res, next) => {
    try {
        const orders = await CreateOrder.findById(req.params.id).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).exec();
        if (!orders) {
            return res.status(404).json({ message: "No orders found for the user", status: false });
        }
        let partyId;
        if (orders.partyId) {
            partyId = await Customer.findById(orders.partyId._id).populate({ path: 'category', model: "customerGroup" });
            if (!partyId) {
                console.log("Party details not found");
            }
        } else {
            console.log("Party ID not found in orders");
        }
        return res.status(200).json({ orderHistory: { ...orders.toObject(), partyId: undefined, partyId }, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};

export const updateCreateOrderStatus1 = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const order = await CreateOrder.findById({ _id: orderId }).populate({ path: "userId", model: "user" }).populate({ path: "orderItems.productId", model: "product" });
        if (!order) {
            return res.status(404).json({ message: 'sales order not found' });
        }
        order.status = status;
        await order.save();
        const invoice = {
            fullName: order.fullName,
            invoiceId: order.invoiceId,
            address: order.address,
            MobileNo: order.MobileNo,
            grandTotal: order.grandTotal,
            country: order.country,
            state: order.state,
            city: order.city,
            pincode: order.pincode,
            landMark: order.landMark,
            discount: order.discount,
            shippingCost: order.shippingCost,
            taxAmount: order.taxAmount,
            date: order.date,
            orderItems: order.orderItems
        }
        const pdfFilePath = path.resolve(__dirname, 'invoice.pdf');
        await pdf.create(createInvoiceTemplate(invoice), {}).toFile(pdfFilePath, (err) => {
            if (err) {
                console.log(err);
            }
        })
        // pathToAttachment = await path.join(__dirname, './invoice.pdf')
        const attachment = await fs.readFileSync(pdfFilePath).toString("base64")

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: req.body.email,
            subject: 'Pdf Generate document',
            html: `
        Testing Pdf Generate document, Thanks.`,
            attachments: [
                {
                    content: attachment,
                    filename: 'invoice.pdf',
                    contentType: 'application/pdf',
                    path: pdfFilePath
                }
            ]
        }, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                res.send("Mail has been sended to your email. Check your mail")
            }
        })
        return res.status(200).json({ Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};

export const updateCreateOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const updatedFields = req.body;
        if (!orderId || !updatedFields) {
            return res.status(400).json({ message: "Invalid input data", status: false });
        }
        const order = await CreateOrder.findById({ _id: orderId });
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
                            pro.currentStock -= (quantityChange);
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

export const autoBillingLock = async (req, res, next) => {
    try {
        const order = await Order.find({ userId: req.params.id })
        const orders = await order[order.length - 1];
        const time1 = await new Date(order[order.length - 1].createdAt);
        const currentDate = new Date();
        const timeDifference = currentDate - time1;
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        if (days >= 15) {
            orders.status = "locked";
            await order.save();
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const SalesOrderList = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        if (!adminDetail.length > 0) {
            return res.status(404).json({ error: "Product Not Found", status: false })
        }
        const orders = await Order.find({ database: database }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).exec();
        const createOrder = await CreateOrder.find({ database: database }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).exec();
        if ((!orders || orders.length === 0) && (!createOrder || createOrder.length === 0)) {
            return res.status(404).json({ message: "No orders found", status: false });
        }
        const ordersDetails = await orders.concat(createOrder)
        return res.status(200).json({ orderHistory: ordersDetails, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const placeOrderHistory = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const adminDetail = await getOrderHierarchy(userId)
        return (adminDetail.length > 0) ? res.status(200).json({ orderHistory: adminDetail, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const createOrderHistory = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const adminDetail = await getCreateOrderHierarchy(userId)
        return (adminDetail.length > 0) ? res.status(200).json({ orderHistory: adminDetail, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const updateCreateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const order = await CreateOrder.findById({ _id: orderId }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" }).populate({ path: "orderItems.productId", model: "product" });
        if (!order) {
            return res.status(404).json({ message: 'sales order not found' });
        }
        order.status = status;
        await order.save();
        const timestamp = new Date().toISOString().replace(/[-:]/g, '');
        const invoiceFilename = `invoice_${timestamp}.pdf`;
        const pdfFilePath = path.resolve(__dirname, invoiceFilename);
        await new Promise((resolve, reject) => {
            pdf.create(createInvoiceTemplate(order), {}).toFile(pdfFilePath, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        const attachment = fs.readFileSync(pdfFilePath).toString("base64");
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: order.partyId.email,
            subject: 'Pdf Generate document',
            html: 'Testing Pdf Generate document, Thanks.',
            attachments: [
                {
                    content: attachment,
                    filename: invoiceFilename,
                    contentType: 'application/pdf',
                    path: pdfFilePath
                }
            ]
        }, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                fs.unlinkSync(pdfFilePath);
                res.send("Mail has been sent to your email. Check your mail");
            }
        });
        return res.status(200).json({ Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};

export const checkPartyOrderLimit = async (req, res, next) => {
    try {
        const party = await PartyOrderLimit.findOne({ partyId: req.params.id }).sort({ sortorder: -1 })
        if (!party) {
            const customer = await Customer.findById(req.params.id)
            const CustomerLimit = customer.limit;
            return res.status(200).json({ CustomerLimit, message: `The limit on your order amount is ${CustomerLimit}`, status: true })
        } else {
            const CustomerLimit = party.remainingAmount;
            return res.status(200).json({ CustomerLimit, message: `The limit on your order amount is ${CustomerLimit}`, status: true })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

// export const ProductWiseSalesReport = async (req, res, next) => {
//     try {
//         let orders = [];
//         const salesOrder = await CreateOrder.find({ database: req.params.database }).populate({ path: "orderItems.productId", model: "product" });
//         if (salesOrder.length === 0) {
//             return res.status(404).json({ message: "Not Found", status: false });
//         }
//         for (let order of salesOrder) {
//             orders = orders.concat(order.orderItems);
//         }
//         console.log(orders);
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ error: "Internal Server Error", status: false });
//     }
// };

export const ProductWiseSalesReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let orders = [];
        const salesOrder = await CreateOrder.find(targetQuery).populate({ path: "orderItems.productId", model: "product" });
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
