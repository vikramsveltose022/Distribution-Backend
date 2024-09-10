import { InvoiceList } from "../model/createInvoice.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";
import { Customer } from "../model/customer.model.js";
import { ledgerPartyForCredit, ledgerPartyForDebit } from "../service/ledger.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { OverDueReport } from "../model/overDue.mode.js";
import { Product } from "../model/product.model.js";
import { addProductInWarehouse, addProductInWarehouse2 } from "./product.controller.js";
import { Warehouse } from "../model/warehouse.model.js";
import { ClosingStock } from "../model/closingStock.model.js";
import { create } from "html-pdf";
import { CustomerGroup } from "../model/customerGroup.model.js";


export const SaveInvoiceList = async (req, res, next) => {
    try {
        let ware
        let particular = "SalesInvoice"
        const orderId = req.params.id;
        const createOrder = await CreateOrder.findById(orderId);
        if (!createOrder) {
            return res.status(404).json({ message: "Order not found", status: false });
        }
        const { partyId } = createOrder;
        const party = await Customer.findById({ _id: partyId })
        if (!party) {
            return res.status(404).json({ message: "party not found", status: false })
        }
        if (party.paymentTerm.toLowerCase() !== "cash") {
            const due = await OverDueReport.findOne({ partyId: partyId, activeStatus: "Active" })
            if (due) {
                const lastOrderDate = due?.createdAt
                const currentDate = new Date();
                const timeDifference = currentDate - lastOrderDate;
                const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
                // if (days >= party.lockInTime && due.remainingAmount > 0) {
                //     party.autoBillingStatus = "locked";
                //     due.dueStatus = "overDue"
                //     await due.save()
                //     await party.save()
                //     return res.status(400).json({ message: "First, you need to pay the previous payment", status: false });
                // } else if (due?.remainingAmount > 0 && due?.lockingAmount <= due?.remainingAmount) {
                //     party.autoBillingStatus = "locked";
                //     due.dueStatus = "overDue";
                //     await due.save()
                //     await party.save()
                //     return res.status(400).json({ message: "First, you need to pay the previous payment", status: false });
                // }
            }
        }
        // const existingInvoice = await InvoiceList.findOne({ orderId });
        const existingInvoice = await CreateOrder.findOne({ orderId, invoiceStatus: true });
        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice already created for this order", status: false });
        }
        for (const orderItem of createOrder.orderItems) {
            const product = await Product.findById({ _id: orderItem.productId._id });
            if (product) {
                ware = product.warehouse
                product.salesDate = new Date(new Date())
                const warehouse = await Warehouse.findById(product.warehouse)
                if (warehouse) {
                    const pro = warehouse.productItems.find((item) => item.productId.toString() === orderItem.productId.toString())
                    // pro.currentStock -= (orderItem.qty);
                    // if (pro.currentStock < 0) {
                    // return res.status(404).json({ message: "out of stock", status: false })
                    // }
                    // pro.pendingStock += (orderItem.qty)
                    // await warehouse.save();
                    // await product.save()
                    // await ClosingSales(orderItem, product.warehouse)
                }
            } else {
                console.error(`Product with ID ${orderItem.productId._id} not found`);
            }
        }
        createOrder.discountDetails = req.body.discountDetails
        createOrder.gstOtherCharges = req.body.gstOtherCharges
        createOrder.chargesDetails = req.body.chargesDetails
        createOrder.orderItems = req.body.orderItems
        createOrder.amount = req.body.amount
        createOrder.igstTotal = req.body.igstTotal
        createOrder.sgstTotal = req.body.sgstTotal
        createOrder.cgstTotal = req.body.cgstTotal
        createOrder.roundOff = req.body.roundOff
        createOrder.grandTotal = req.body.grandTotal
        createOrder.warehouseId = ware
        createOrder.orderId = orderId
        createOrder.invoiceType = "sales"
        createOrder.invoiceStatus = true
        createOrder.status = req.body.status
        createOrder.transporter = req.body.transporter
        createOrder.vehicleNo = req.body.vehicleNo
        createOrder.ARNStatus = req.body.ARNStatus
        createOrder.ARN = req.body.ARN
        createOrder.overAllDiscountPer = req.body.overAllDiscountPer
        createOrder.overAllCharges = req.body.overAllCharges
        createOrder.AssignDeliveryBoy = req.body.AssignDeliveryBoy
        const updated = await createOrder.save()
        // if (updated) {
        //     await ledgerPartyForDebit(updated, particular)
        // }
        return res.status(201).json({ message: "InvoiceList created successfully", Invoice: updated, status: true, data: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const viewInvoiceList = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        if (!adminDetail.length > 0) {
            return res.status(404).json({ error: "Invoice Not Found", status: false })
        }
        const invoice = await InvoiceList.find({ invoiceType: "sales", database: database }).sort({ sortorder: -1 }).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: 'partyId', model: 'customer' })
        return invoice.length > 0 ? res.status(200).json({ Invoice: invoice, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateOrderInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await InvoiceList.findById({ _id: req.params.id });
        if (!order) {
            return res.status(404).json({ message: 'this invoice not found' });
        }
        order.status = status;
        await order.save();
        return res.status(200).json({ message: "status update successfully", status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}

export const UpdatedInvoice = async (req, res, next) => {
    try {
        const invoiceId = req.params.id;
        const existingInvoice = await InvoiceList.findById(invoiceId);
        if (!existingInvoice) {
            return res.status(404).json({ error: 'invoice not found', status: false });
        }
        else {
            const updatedInvoice = req.body;
            await InvoiceList.findByIdAndUpdate(invoiceId, updatedInvoice, { new: true });
            return res.status(200).json({ message: 'Invoice Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};

export const SavePurchaseInvoice1 = async (req, res, next) => {
    try {
        let particular = "PurchaseInvoice"
        const orderId = req.params.id;
        const purchase = await PurchaseOrder.findById(orderId);
        if (!purchase) {
            return res.status(404).json({ message: "Order not found", status: false });
        }
        const existingInvoice = await InvoiceList.findOne({ orderId });
        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice already created for this order", status: false });
        }
        for (const orderItem of req.body.orderItems) {
            const product = await Product.findOne({ _id: orderItem.productId });
            if (product) {
                const current = new Date(new Date())
                product.purchaseDate = current
                product.partyId = req.body.partyId;
                product.purchaseStatus = true
                // product.landedCost = orderItem.landedCost;
                product.qty += orderItem.qty;
                product.pendingQty -= orderItem.qty;
                const warehouse = { productId: orderItem.productId, currentStock: (orderItem.qty), transferQty: (orderItem.qty), price: orderItem.price, totalPrice: orderItem.totalPrice, gstPercentage: orderItem.gstPercentage, igstTaxType: orderItem.igstTaxType, primaryUnit: orderItem.primaryUnit, secondaryUnit: orderItem.secondaryUnit, secondarySize: orderItem.secondarySize, landedCost: orderItem.landedCost }
                await product.save();
                await addProductInWarehouse(warehouse, product.warehouse)
                await ClosingPurchase(orderItem, product.warehouse)
            } else {
                return res.status(404).json(`Product with ID ${orderItem.productId} not found`);
            }
        }
        req.body.orderId = orderId
        req.body.invoiceType = "purchase"
        const invoiceList = await InvoiceList.create(req.body);
        if (invoiceList) {
            await ledgerPartyForCredit(invoiceList, particular)
        }
        return res.status(201).json({ message: "InvoiceList created successfully", Invoice: invoiceList, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const SavePurchaseInvoice = async (req, res, next) => {
    try {
        let groupDiscount = 0;
        let particular = "PurchaseInvoice"
        const orderId = req.params.id;
        const purchase = await PurchaseOrder.findById(orderId);
        if (!purchase) {
            return res.status(404).json({ message: "Purchase Order Not Found", status: false });
        }
        const existingInvoice = await PurchaseOrder.findOne({ _id: orderId, invoiceStatus: true });
        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice already created for this order", status: false });
        }
        if (req.body.status === "cancelled") {
            purchase.orderId = orderId
            purchase.invoiceType = "purchase"
            // purchase.invoiceStatus = true
            purchase.status = req.body.status;
            const invoiceList = await purchase.save()
            return res.status(201).json({ message: "Purchase Status Update Successfully", Invoice: invoiceList, status: true });
        } else {
            for (const orderItem of purchase.orderItems) {
                const product = await Product.findOne({ _id: orderItem.productId });
                if (product) {
                    const group = await CustomerGroup.find({ database: product.database, status: "Active" })
                    if (group.length > 0) {
                        const maxDiscount = group.reduce((max, group) => {
                            return group.discount > max.discount ? group : max;
                        });
                        groupDiscount = maxDiscount.discount;
                    }
                    product.Purchase_Rate = orderItem.landedCost;
                    if (!product.ProfitPercentage || product.ProfitPercentage === 0) {
                        product.SalesRate = product.Purchase_Rate * 1.03;
                        product.Product_MRP = (product.SalesRate) * (1 + product.GSTRate / 100) * (1 + groupDiscount / 100);
                    }
                    const current = new Date(new Date())
                    product.purchaseDate = current
                    product.partyId = purchase.partyId;
                    product.purchaseStatus = true
                    product.qty += orderItem.qty;
                    await product.save();
                    await addProductInWarehouse2(product, product.warehouse, orderItem)
                    await ClosingPurchase(orderItem, product.warehouse)
                } else {
                    return res.status(404).json(`Product with ID ${orderItem.productId} not found`);
                }
            }
            purchase.orderId = orderId
            purchase.invoiceType = "purchase"
            purchase.invoiceStatus = true
            purchase.status = req.body.status;
            const invoiceList = await purchase.save()
            if (invoiceList) {
                await ledgerPartyForCredit(invoiceList, particular)
            }
            return res.status(201).json({ message: "InvoiceList created successfully", Invoice: invoiceList, status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const viewInvoiceListPurchase = async (req, res, next) => {
    try {
        // const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Invoice Not Found", status: false })
        // }
        const invoice = await InvoiceList.find({ invoiceType: "purchase", database: database }).sort({ sortorder: -1 }).populate({ path: 'orderItems.productId', model: 'product' }).populate({ path: 'partyId', model: 'customer' })
        return invoice.length > 0 ? res.status(200).json({ Invoice: invoice, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const ClosingPurchase = async (orderItem, warehouse) => {
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
        // tax = (orderItem.igstRate + orderItem.cgstRate + orderItem.sgstRate)
        const stock = await ClosingStock.findOne({ warehouseId1: warehouse, productId: orderItem.productId })
        if (stock) {
            stock.pQty += (orderItem.qty);
            stock.pRate += (orderItem.price);
            stock.pBAmount += orderItem.totalPrice;
            stock.pTaxRate += tax;
            stock.pTotal += (orderItem.totalPrice + tax)
            await stock.save()
        } else {
            const closing = ClosingStock({ warehouseId1: warehouse, productId: orderItem.productId, pQty: (orderItem.qty), pRate: orderItem.price, pBAmount: orderItem.totalPrice, pTaxRate: tax, pTotal: (orderItem.totalPrice + tax) })
            await closing.save()
        }
        return true
    }
    catch (err) {
        console.log(err)
    }
}
export const ClosingSales = async (orderItem, warehouse) => {
    try {
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;
        let tax = 0
        const rate = parseInt(orderItem.gstPercentage) / 2;
        if (orderItem.igstTaxType === false) {
            cgstRate = (((orderItem.qty) * orderItem.price) * rate) / 100;
            sgstRate = (((orderItem.qty) * orderItem.price) * rate) / 100;
            tax = cgstRate + sgstRate.sgstRate
        } else {
            igstRate = (((orderItem.qty) * orderItem.price) * parseInt(orderItem.gstPercentage)) / 100;
            tax = igstRate
        }
        // tax = (orderItem.igstRate + orderItem.cgstRate + orderItem.sgstRate)
        const stock = await ClosingStock.findOne({ warehouseId1: warehouse, productId: orderItem.productId })
        if (stock) {
            stock.sQty += (orderItem.qty);
            stock.sRate += (orderItem.price);
            stock.sBAmount += orderItem.totalPrice;
            stock.sTaxRate += tax;
            stock.sTotal += (orderItem.totalPrice + tax)
            await stock.save()
        } else {
            const closing = ClosingStock({ warehouseId1: warehouse, productId: orderItem.productId, sQty: (orderItem.qty), sRate: orderItem.price, sBAmount: orderItem.totalPrice, sTaxRate: tax, sTotal: (orderItem.totalPrice + tax) })
            await closing.save()
        }
        return true
    }
    catch (err) {
        console.log(err)
    }
}
