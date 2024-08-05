import { SalesReturn } from "../model/salesReturn.model.js";
import { Order } from "../model/order.model.js";
import { CreditNote } from "../model/creditNote.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { Product } from "../model/product.model.js";
import { getSalesReturnHierarchy } from "../rolePermission/RolePermission.js";
import { User } from "../model/user.model.js";
import { DebitNote } from "../model/debitNote.model.js";
import { Customer } from "../model/customer.model.js";
import { Warehouse } from "../model/warehouse.model.js";

export const viewSalesReturn = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getSalesReturnHierarchy(userId, database)
        return (adminDetail.length > 0) ? res.status(200).json({ SalesReturn: adminDetail, status: true }) : res.status(400).json({ message: "Not Found", status: false })
        // const salesReturn = await SalesReturn.find({}).sort({ sortorder: -1 }).populate({ path: "returnItems.productId", model: "product" });
        // return salesReturn ? res.status(200).json({ SalesReturn: salesReturn, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewSalesReturnById = async (req, res, next) => {
    try {
        const salesReturn = await SalesReturn.find({ orderId: req.params.id }).sort({ sortorder: -1 }).populate({ path: "returnItems.productId", model: "product" });
        return salesReturn ? res.status(200).json({ SalesReturn: salesReturn, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteSalesReturn = async (req, res, next) => {
    try {
        const salesReturn = await SalesReturn.findByIdAndDelete({ _id: req.params.id })
        return salesReturn ? res.status(200).json({ message: "Delete Successfully", status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateSalesReturnOrder = async (req, res) => {
    const { salesReturnId } = req.params.id;
    const updateData = req.body;
    try {
        const existingSalesReturn = await SalesReturn.findOne({ _id: salesReturnId });
        if (!existingSalesReturn) {
            return res.status(404).json({ message: `Sales return with ID ${salesReturnId} not found`, status: false });
        }
        const originalReturnItems = existingSalesReturn.productItems;
        const orderId = existingSalesReturn.orderId;
        await SalesReturn.updateOne({ _id: salesReturnId }, { $set: updateData });
        const promises = updateData.productItems.map(async ({ productId, qtyReturn }) => {
            const order = await Order.findOne({ _id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const orderItem = order.orderItems.find(item => item.productId.toString() === productId);

            if (orderItem) {
                orderItem.qty -= qtyReturn;
                // const product = await Product.findOne({ _id: productId });
                // if (product) {
                //     product.Size += qtyReturn;
                //     await product.save();
                // }
                await order.save();
            }
        });
        await Promise.all(promises);
        const updatedSalesReturn = await SalesReturn.findOne({ _id: salesReturnId });
        return res.status(200).json({ message: 'Sales return updated successfully', updatedSalesReturn });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};
export const saveSalesReturnOrder = async (req, res) => {
    const returnItems = req.body.returnItems;
    const { orderId } = req.body;
    try {
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const promises = returnItems.map(async ({ productId, qtyReturn, qtySales, price }) => {
            const product = await Product.findOne({ _id: productId })
            const order = await Order.findOne({ _id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const orderItem = order.orderItems.find(item => item.productId.toString() === productId);
            if (!orderItem) {
                throw new Error(`Product ${productId} not found in order ${orderId}`);
            }
            if (orderItem.qtySales === 1) {
                // product.Size += qtyReturn;
                orderItem.qty -= qtyReturn;
                order.status = "return";
                orderItem.status = 'return';
                await order.save();
            } else {
                // product.Size += qtyReturn;
                orderItem.qty -= qtyReturn;
                await order.save();
            }
        });
        await Promise.all(promises);
        const totalAmount = returnItems.reduce((total, item) => {
            return total + item.qtyReturn * item.price;
        }, 0);
        req.body.totalAmount = totalAmount;
        req.body.productItems = returnItems;
        await CreditNote.create(req.body)
        const salesReturns = await SalesReturn.create(req.body);
        return res.status(200).json({ message: 'Order returns processed successfully', SalesReturn: salesReturns });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};
export const viewSalesReturnCreateOrder = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getSalesReturnHierarchy(userId, database)
        const adminDetail = await SalesReturn.find({ database: database }).populate({ path: 'returnItems.productId', model: 'product' }).populate({ path: 'orderId', model: 'createOrder' }).populate({ path: 'partyId', model: 'customer' }).populate({ path: 'userId', model: 'user' })
        return (adminDetail.length > 0) ? res.status(200).json({ SalesReturn: adminDetail, status: true }) : res.status(400).json({ message: "Not Found", status: false })
        // const salesReturn = await SalesReturn.find().sort({ sortorder: -1 }).populate({ path: "returnItems.productId", model: "product" });
        // return salesReturn ? res.status(200).json({ SalesReturn: salesReturn, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewSalesReturnCreateOrderById = async (req, res, next) => {
    try {
        const salesReturn = await SalesReturn.findById(req.params.id).sort({ sortorder: -1 }).populate({ path: 'returnItems.productId', model: 'product' }).populate({ path: 'orderId', model: 'createOrder' }).populate({ path: 'partyId', model: 'customer' }).populate({ path: 'userId', model: 'user' })
        return salesReturn ? res.status(200).json({ SalesReturn: salesReturn, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteSalesReturnCreateOrder = async (req, res, next) => {
    try {
        const salesReturn = await SalesReturn.findByIdAndDelete({ _id: req.params.id })
        return salesReturn ? res.status(200).json({ message: "Delete Successfully", status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateSalesReturnCreateOrder = async (req, res, next) => {
    const { salesReturnId } = req.params.id;
    const updateData = req.body;
    try {
        const existingSalesReturn = await SalesReturn.findOne({ _id: salesReturnId });
        if (!existingSalesReturn) {
            return res.status(404).json({ message: `Sales return with ID ${salesReturnId} not found`, status: false });
        }
        const originalReturnItems = existingSalesReturn.productItems;
        const orderId = existingSalesReturn.orderId;
        await SalesReturn.updateOne({ _id: salesReturnId }, { $set: updateData });
        const promises = updateData.productItems.map(async ({ productId, qtyReturn }) => {
            const order = await CreateOrder.findOne({ _id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const orderItem = order.orderItems.find(item => item.productId.toString() === productId);

            if (orderItem) {
                orderItem.qty -= qtyReturn;
                // const product = await Product.findOne({ _id: productId });
                // if (product) {
                //     product.Size += qtyReturn;
                //     await product.save();
                // }
                await order.save();
            }
        });
        await Promise.all(promises);
        const updatedSalesReturn = await SalesReturn.findOne({ _id: salesReturnId });
        return res.status(200).json({ message: 'Sales return updated successfully', updatedSalesReturn });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}
export const saveSalesReturnCreateOrder = async (req, res) => {
    const returnItems = req.body.returnItems;
    const { orderId, partyId } = req.body;
    try {
        const party = await Customer.findById({ _id: partyId })
        const user = await User.findById({ _id: req.body.userId })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const promises = returnItems.map(async ({ productId, qtyReturn, qtySales, price }) => {
            const product = await Product.findOne({ _id: productId })
            const warehouse = await Warehouse.findById({ _id: product.warehouse })
            const item = await warehouse.productItems.find((item) => item.productId === productId)
            const order = await CreateOrder.findOne({ _id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const orderItem = order.orderItems.find(item => item.productId.toString() === productId);
            if (!orderItem) {
                throw new Error(`Product ${productId} not found in order ${orderId}`);
            }
            if (qtySales === 1) {
                item.currentStock += qtyReturn;
                orderItem.qty -= qtyReturn;
                order.status = "return";
                orderItem.status = 'return';
                await order.save();
                await warehouse.save()
            } else {
                item.currentStock += qtyReturn;
                orderItem.qty -= qtyReturn;
                await order.save();
                await warehouse.save()
            }
        });
        await Promise.all(promises);
        const totalAmount = returnItems.reduce((total, item) => {
            return total + item.qtyReturn * item.price;
        }, 0);
        req.body.totalAmount = req.body.Return_amount;
        req.body.productItems = returnItems;
        await CreditNote.create(req.body)
        const salesReturns = await SalesReturn.create(req.body);
        req.body.partyId = req.body.userId;
        req.body.userId = partyId;
        await DebitNote.create(req.body)
        return res.status(200).json({ message: 'Order returns processed successfully', SalesReturn: salesReturns });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};