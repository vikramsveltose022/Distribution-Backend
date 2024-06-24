import axios from "axios";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { PurchaseReturn } from "../model/purchaseReturn.model.js";
import { DebitNote } from "../model/debitNote.model.js";
import { Product } from "../model/product.model.js";
import { User } from "../model/user.model.js";
import { getPurchaseReturnHierarchy, getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";

export const PurchaseReturnXml = async (req, res) => {
    const fileUrl = "https://xmlfile.blr1.cdn.digitaloceanspaces.com/PurchaseReturn.xml";
    try {
        const response = await axios.get(fileUrl);
        const data = response.data;
        return res.status(200).json({ data, status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error reading the file");
    }
};

export const viewPurchaseReturn = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Product Not Found", status: false })
        // }
        const purchaseReturn = await PurchaseReturn.find({ database: database }).sort({ sortorder: -1 }).populate({ path: "returnItems.productId", model: "product" }).populate({ path: "orderId", model: "purchaseOrder" }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" });
        return purchaseReturn ? res.status(200).json({ PurchaseReturn: purchaseReturn, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false })
    }
};
export const viewPurchaseReturnByUserId = async (req, res, next) => {
    try {
        const purchaseReturn = await PurchaseReturn.find({ userId: req.params.id }).sort({ sortorder: -1 }).populate({ path: "returnItems.productId", model: "product" }).populate({ path: "orderId", model: "purchaseOrder" }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" });
        return purchaseReturn ? res.status(200).json({ PurchaseReturn: purchaseReturn, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false })
    }
};
export const deletePurchaseReturn = async (req, res, next) => {
    try {
        const purchaseReturn = await PurchaseReturn.findByIdAndDelete({ _id: req.params.id })
        return purchaseReturn ? res.status(200).json({ message: "Delete Successfully", status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false })
    }
};
export const updatePurchaseReturn = async (req, res) => {
    const { purchaseReturnId } = req.params.id;
    const updateData = req.body;
    try {
        const existingPurchaseReturn = await PurchaseReturn.findOne({ _id: purchaseReturnId });
        if (!existingPurchaseReturn) {
            return res.status(404).json({ message: `Sales return with ID ${purchaseReturnId} not found`, status: false });
        }
        const originalReturnItems = existingPurchaseReturn.productItems;
        const orderId = existingPurchaseReturn.orderId;
        await PurchaseReturn.updateOne({ _id: purchaseReturnId }, { $set: updateData });
        const promises = updateData.productItems.map(async ({ productId, qtyReturn }) => {
            const order = await PurchaseOrder.findOne({ _id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const orderItem = order.orderItems.find(item => item.productId.toString() === productId);
            // if (orderItem) {
            //     orderItem.qty -= qtyReturn;
            //     const product = await Product.findOne({ _id: productId });
            //     if (product) {
            //         product.Size += qtyReturn;
            //         await product.save();
            //     }
            //     await order.save();
            // }
        });
        await Promise.all(promises);
        const updatedSalesReturn = await PurchaseReturn.findOne({ _id: purchaseReturnId });
        return res.status(200).json({ message: 'Sales return updated successfully', updatedSalesReturn });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
};
export const savePurchaseReturnOrder = async (req, res) => {
    const returnItems = req.body.returnItems;
    const { orderId } = req.body;
    try {
        const user = await User.findById({ _id: req.body.userId })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const promises = returnItems.map(async ({ productId, qtyReturn, qtyPurchase, price }) => {
            const product = await Product.findOne({ _id: productId })
            const order = await PurchaseOrder.findOne({ _id: orderId });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const orderItem = order.orderItems.find(item => item.productId.toString() === productId);
            if (!orderItem) {
                throw new Error(`Product ${productId} not found in order ${orderId}`);
            }
            if (qtyPurchase === 1) {
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
        req.body.userId = req.body.userId;
        await DebitNote.create(req.body)
        const orderReturns = await PurchaseReturn.create(req.body);
        return res.status(200).json({ message: 'Purchase Order returns processed successfully', orderReturns });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};