import dotenv from "dotenv";
import moment from "moment";
import path from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs"
import pdf from 'html-pdf'
import { User } from "../model/user.model.js";
import { Product } from "../model/product.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { generateInvoice, generateOrderNo } from "../service/invoice.js";
import { getCreateOrderHierarchy, getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";
import { Customer } from "../model/customer.model.js";
import { createInvoiceTemplate } from "../Invoice/invoice.js";
import transporter from "../service/email.js";
import { Warehouse } from "../model/warehouse.model.js";
import { UpdateCheckLimitSales, checkLimit } from "../service/checkLimit.js";
import { PartyOrderLimit } from "../model/partyOrderLimit.model.js";
import { Ledger } from "../model/ledger.model.js";
import { ClosingStock } from "../model/closingStock.model.js";
import { Receipt } from "../model/receipt.model.js";
import { ClosingSales } from "./createInvoice.controller.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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
            // const result = await generateInvoice(user.database);
            // if (50000 >= req.body.grandTotal) {
            //     req.body.challanNo = result
            // } else {
            //     req.body.invoiceId = result
            // }
            const orderNo = await generateOrderNo(user.database);
            const billAmount = orderItems.reduce((total, orderItem) => {
                return total + (orderItem.price * orderItem.qty);
            }, 0);
            for (const orderItem of orderItems) {
                const product = await Product.findById({ _id: orderItem.productId });
                if (product) {
                    // orderItem.warehouse = product.warehouse;
                    // ware = product.warehouse
                    product.salesDate = new Date()
                    const warehouse = await Warehouse.findById(product.warehouse)
                    if (warehouse) {
                        const pro = warehouse.productItems.find((item) => item.productId.toString() === orderItem.productId.toString())
                        pro.currentStock -= (orderItem.qty);
                        product.qty -= orderItem.qty;
                        product.pendingQty += orderItem.qty;
                        // if (pro.currentStock < 0) {
                        //     return res.status(404).json({ message: `Product Out Of Stock ${product.Product_Title}`, status: false })
                        // }
                        // pro.pendingStock += (orderItem.qty)
                        await warehouse.save();
                        await product.save()
                    }
                } else {
                    console.error(`Product with ID ${orderItem.productId} not found`);
                }
            }
            req.body.userId = party.created_by
            req.body.database = user.database
            req.body.orderNo = orderNo
            req.body.orderItems = orderItems
            // req.body.warehouseId = ware
            const savedOrder = CreateOrder.create(req.body)
            req.body.database = user.database;
            req.body.totalAmount = req.body.grandTotal;
            req.body.orderId = savedOrder._id;
            if (party.paymentTerm === "credit") {
                await checkLimit(req.body)
            }
            return res.status(200).json({ orderDetail: savedOrder, status: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
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
        for (const orderItem of order.orderItems) {
            const product = await Product.findById({ _id: orderItem.productId });
            if (product) {
                // ware = product.warehouse
                // product.salesDate = new Date()
                // const warehouse = await Warehouse.findById(product.warehouse)
                // if (warehouse) {
                //     const pro = warehouse.productItems.find((item) => item.productId === orderItem.productId.toString())
                //     pro.currentStock += (orderItem.qty);
                product.qty += orderItem.qty;
                product.pendingQty += orderItem.qty;
                //     if (pro.currentStock < 0) {
                //         return res.status(404).json({ message: "Product Out Of Stock", status: false })
                //     }
                // await warehouse.save();
                await product.save()
                // }
            } else {
                console.error(`Product With ID ${orderItem.productId} Not Found`);
            }
        }
        await UpdateCheckLimitSales(order)
        order.status = "Deactive";
        await order.save();
        return res.status(200).json({ message: "delete successfull!", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
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
export const OrdertoBilling = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await CreateOrder.findById({ _id: orderId })
        if (!order) {
            return res.status(404).json({ message: 'Sales Order Not Found', status: false });
        }
        for (const orderItem of req.body.orderItems) {
            const product = await Product.findById({ _id: orderItem.productId });
            if (product) {
                product.salesDate = new Date(new Date())
                const warehouse = await Warehouse.findById(orderItem.warehouse)
                if (warehouse) {
                    const pro = warehouse.productItems.find((item) => item.productId.toString() === orderItem.productId.toString())
                    // pro.currentStock -= (orderItem.qty);
                    // product.qty -= orderItem.qty;
                    // if (pro.currentStock < 0) {
                    // return res.status(404).json({ message: `Product Out Of Stock ${product.Product_Title}`, status: false })
                    // }
                    // pro.pendingStock += (orderItem.qty)
                    // await warehouse.save();
                    // await product.save()
                    // await ClosingSales(orderItem, orderItem.warehouse)
                }
            } else {
                console.error(`Product with ID ${orderItem.productId._id} not found`);
            }
        }
        order.orderItems = req.body.orderItems;
        order.status = "Billing";
        await order.save();
        return res.status(200).json({ message: "Order Billing Seccessfull!", Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

// Order To Dispatch
export const OrdertoDispatch = async (req, res) => {
    try {
        const Checked = []
        const orderId = req.params.id;
        const order = await CreateOrder.findById({ _id: orderId })
        if (!order) {
            return res.status(404).json({ message: 'Sales Order Not Found', status: false });
        }
        for (const orderItem of order.orderItems) {
            if (orderItem.warehouse.toString() === req.body.warehouse.toString()) {
                orderItem.status = "Dispatch";
            }
            if (orderItem.status === "Dispatch") {
                order.status = "Dispatch"
            }
            else {
                Checked.push(orderItem)
            }
        }
        if (order.NoOfPackage) {
            order.NoOfPackage += req.body.NoOfPackage
        } else {
            order.NoOfPackage = req.body.NoOfPackage
        }
        if (Checked.length !== 0) {
            order.status = "Billing"
        }
        await order.save();
        return res.status(200).json({ message: "Order Dispatch Seccessfull!", Order: order, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error", status: false });
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
                        product.qty -= quantityChange;
                        product.pendingQty += quantityChange;
                        const warehouse = await Warehouse.findById({ _id: product.warehouse })
                        if (warehouse) {
                            const pro = warehouse.productItems.find((item) => item.productId.toString() === newOrderItem.productId.toString())
                            pro.currentStock -= (quantityChange);
                            await warehouse.save();
                        }
                        await product.save()
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
export const SalesOrderList = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        if (!adminDetail.length > 0) {
            return res.status(404).json({ error: "Product Not Found", status: false })
        }
        const createOrder = await CreateOrder.find({ database: database }).populate({
            path: 'orderItems.productId',
            model: 'product'
        }).populate({ path: "partyId", model: "customer" }).exec();
        if ((!createOrder || createOrder.length === 0)) {
            return res.status(404).json({ message: "No orders found", status: false });
        }
        return res.status(200).json({ orderHistory: createOrder, status: true });
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
        // const party = await PartyOrderLimit.findOne({ partyId: req.params.id })
        const party = await Customer.findById(req.params.id)
        if (party) {
            const CustomerLimit = (party.remainingLimit > 0) ? party.remainingLimit : party.limit;
            return res.status(200).json({ CustomerLimit, message: `The limit on your order amount is ${CustomerLimit}`, status: true })
        } else {
            return res.status(404).json({ message: "Party Not Found", status: true })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
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
// Order History App
export const ViewOrderHistoryForPartySalesPerson = async (req, res, next) => {
    try {
        const orders = await CreateOrder.find({ partyId: req.params.id, status: { $ne: "Deactive" } }).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" })
        return res.status(200).json({ orderHistory: orders, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

//  For DashBoard
export const SalesOrderCalculate111 = async (req, res, next) => {
    try {
        let salesOrders = {
            totalAmount: 0,
            lastMonthAmount: 0,
            averageAmount: 0,
            totalPending: 0,
            totalDelivery: 0
        };
        const previousMonthStart = moment().subtract(1, 'months').startOf('month').toDate();
        const previousMonthEnd = moment().subtract(1, 'months').endOf('month').toDate();
        const order = await CreateOrder.find({ database: req.params.database }).sort({ sortorder: -1 })
        if (order.length === 0) {
            return res.status(404).json({ message: "Sales Order Not Found", status: false })
        }
        const lastMonth = order[0].createdAt.getMonth() + 1
        for (let item of order) {
            if (item.status === "Completed") {
                salesOrders.totalAmount += item.grandTotal
            }
            if (item.status === "pending") {
                salesOrders.totalPending++
            }
            if (item.status === "Pending for Delivery") {
                salesOrders.totalDelivery++
            }
        }
        const orders = await CreateOrder.find({
            database: req.params.database, status: "Completed",
            createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
        });
        if (orders.length === 0) {
            return res.status(404).json({ message: "Sales Order Not Found", status: false })
        }
        for (let item of orders) {
            salesOrders.lastMonthAmount += item.grandTotal
        }
        salesOrders.averageAmount = (salesOrders.totalAmount / lastMonth).toFixed(2)
        res.status(200).json({ salesOrders, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const SalesOrderCalculate = async (req, res, next) => {
    try {
        let salesOrders = {
            totalAmount: 0,
            lastMonthAmount: 0,
            averageAmount: 0,
            totalPending: 0,
            totalDelivery: 0
        };
        const previousMonthStart = moment().subtract(1, 'months').startOf('month').toDate();
        const previousMonthEnd = moment().subtract(1, 'months').endOf('month').toDate();
        const orders = await CreateOrder.find({ database: req.params.database }).sort({ sortorder: -1 });
        if (orders.length === 0) {
            return res.status(404).json({ message: "Sales Order Not Found", status: false });
        }
        let completedOrdersLastMonth = [];
        const lastMonth = orders[0].createdAt.getMonth() + 1
        orders.forEach(order => {
            if (order.status === "Completed") {
                salesOrders.totalAmount += order.grandTotal;
                if (moment(order.createdAt).isBetween(previousMonthStart, previousMonthEnd, null, '[]')) {
                    completedOrdersLastMonth.push(order);
                }
            } else if (order.status === "pending") {
                salesOrders.totalPending++;
            } else if (order.status === "Pending for Delivery") {
                salesOrders.totalDelivery++;
            }
        });
        completedOrdersLastMonth.forEach(order => {
            salesOrders.lastMonthAmount += order.grandTotal;
        });
        salesOrders.averageAmount = (salesOrders.totalAmount / lastMonth).toFixed(2);
        return res.status(200).json({ SalesCalculation: salesOrders, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

// For DashBoard
export const DebitorCalculate = async (req, res, next) => {
    try {
        let Debtor = {
            totalReceipt: 0,
            totalDue: 0,
            currentReceipt: 0,
            currentOutstanding: 0,
            totalOutstanding: 0
        };
        let currentSales;
        // const startOfDay = moment().startOf('day').toDate();
        // const endOfDay = moment().endOf('day').toDate();
        const startOfDay = moment().startOf('month').toDate();
        const endOfDay = moment().endOf('month').toDate();
        const [salesOrder, salesOrderCurrentMonth, receipt, receipts] = await Promise.all([
            CreateOrder.find({ database: req.params.database, status: "Completed" }).sort({ sortorder: -1 }),
            CreateOrder.find({ database: req.params.database, status: "Completed", createdAt: { $gte: startOfDay, $lte: endOfDay } }).sort({ sortorder: -1 }),
            Receipt.find({ database: req.params.database, type: "receipt", status: "Active" }).sort({ sortorder: -1 }),
            Receipt.find({ database: req.params.database, type: "receipt", createdAt: { $gte: startOfDay, $lte: endOfDay }, status: "Active" }).sort({ sortorder: -1 })
        ]);

        // Calculate totals
        Debtor.totalDue = salesOrder.reduce((sum, item) => sum + item.grandTotal, 0);
        currentSales = salesOrderCurrentMonth.reduce((sum, item) => sum + item.grandTotal, 0);
        Debtor.totalReceipt = receipt.reduce((sum, item) => sum + item.amount, 0);
        Debtor.currentReceipt = receipts.reduce((sum, item) => sum + item.amount, 0);
        // Debtor.totalOutstanding = Debtor.totalDue - Debtor.totalReceipt;
        // Debtor.currentOutstanding = currentSales - Debtor.currentReceipt;

        res.status(200).json({ Debtor, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

// --------------------------------------------
export const deletedSalesOrder = async (req, res, next) => {
    try {
        const order = await CreateOrder.findById(req.params.id)
        if (!order) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        for (const orderItem of order.orderItems) {
            const product = await Product.findById({ _id: orderItem.productId });
            if (product) {
                // ware = product.warehouse
                // product.salesDate = new Date()
                const warehouse = await Warehouse.findById(orderItem.warehouse)
                if (warehouse) {
                    const pro = warehouse.productItems.find((item) => item.productId === orderItem.productId.toString())
                    pro.currentStock += (orderItem.qty);
                    product.qty += orderItem.qty;
                    product.pendingQty -= orderItem.qty;
                    if (pro.currentStock < 0) {
                        return res.status(404).json({ message: "Product Out Of Stock", status: false })
                    }
                    // pro.pendingStock -= (orderItem.qty)
                    await warehouse.save();
                    await product.save()
                    await DeleteClosingSales(orderItem, orderItem.warehouse)
                }
            } else {
                console.error(`Product With ID ${orderItem.productId} Not Found`);
            }
        }
        await UpdateCheckLimitSales(order)
        order.status = "Deactive";
        await order.save();
        await Ledger.findOneAndDelete({ orderId: req.params.id })
        return res.status(200).json({ message: "delete successfull!", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteClosingSales = async (orderItem, warehouse) => {
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
            stock.sQty -= (orderItem.qty);
            stock.sBAmount -= orderItem.totalPrice;
            stock.sTaxRate -= tax;
            stock.sTotal -= (orderItem.totalPrice + tax)
            await stock.save()
            // console.log("ClosingSales : " + stock)
        }
        // return true
    }
    catch (err) {
        console.log(err)
    }
}

// For Customer Target, Purchase Product Qty By Customer
export const PartyPurchaseqty = async (req, res, next) => {
    try {
        const previousMonthStart = moment().subtract(1, 'months').startOf('month').toDate();
        const previousMonthEnd = moment().subtract(1, 'months').endOf('month').toDate();
        let qty = 0;
        const partyOrder = await CreateOrder.find({
            partyId: req.params.partyId,
            createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
        });
        if (!partyOrder.length) {
            return res.status(200).json({ qty, status: true });
        }
        for (let item of partyOrder) {
            for (let orderItem of item.orderItems) {
                if (orderItem.productId.toString() === req.params.productId) {
                    qty += orderItem.qty;
                }
            }
        }
        return res.status(200).json({ qty, status: true });
    } catch (err) {
        console.error("Error fetching party purchase quantity:", err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}