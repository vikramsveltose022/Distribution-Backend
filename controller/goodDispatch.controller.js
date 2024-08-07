import { GoodDispatch } from "../model/goodDispatch.model.js";
import { Order } from "../model/order.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import transporter from "../service/email.js";
import { User } from "../model/user.model.js";
import { getGoodDispatchHierarchy, getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";
import { Customer } from "../model/customer.model.js";
import { Warehouse } from "../model/warehouse.model.js";
import { Product } from "../model/product.model.js";
import { ledgerPartyForDebit } from "../service/ledger.js";
import { OtpVerify } from "../model/otpVerify.model.js";


export const saveGoodDispatch = async (req, res) => {
    try {
        let ware
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const order = await Order.findById({ _id: req.body.orderId })
        const orders = await CreateOrder.findById({ _id: req.body.orderId })
        if (!order && !orders) {
            return res.status(404).json({ message: "Order not found", status: false });
        }
        if (orders) {
            orders.status = req.body.status;
            await orders.save();
        }
        if (order) {
            order.status = req.body.status;
            await order.save();
        }

        req.body.warehouseId = orders.warehouseId
        req.body.orderItems = JSON.parse(req.body.orderItems)
        for (const orderItem of req.body.orderItems) {
            const product = await Product.findById({ _id: orderItem.productId._id });
            if (product) {
                // ware = product.warehouse
                // product.salesDate = new Date(new Date())
                const warehouse = await Warehouse.findById(product.warehouse)
                if (warehouse) {
                    const pro = warehouse.productItems.find((item) => item.productId === orderItem.productId._id)
                    // pro.currentStock -= (orderItem.Size * orderItem.qty);
                    // if (pro.currentStock < 0) {
                    //     return res.status(404).json({ message: "out of stock", status: false })
                    // }
                    pro.pendingStock -= (orderItem.qty)
                    await warehouse.save();
                    // await product.save()
                }
            } else {
                console.error(`Product with ID ${orderItem.productId} not found`);
            }
        }
        if (req.files) {
            let image = null;
            let images = null;
            req.files.map(file => {
                if (file.fieldname === "invoice") {
                    image = file.filename;
                }
                else {
                    images = file.filename
                }
            })
            req.body.FetchSalesInvoice = image;
            req.body.CNUpload = images
        }
        const goodDispatch = await GoodDispatch.create(req.body);
        return goodDispatch ? res.status(200).json({ message: "save data successfull", status: true }) : res.status(400).json({ message: "Bad Request", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateGoodDispatch = async (req, res) => {
    try {
        const goodDispatchId = req.params.id;
        const existingGoodDispatch = await GoodDispatch.findById({ _id: goodDispatchId });
        if (!existingGoodDispatch) {
            return res.status(404).json({ error: 'goodDispatch not found', status: false });
        }
        else {
            if (req.file) {
                req.body.salesInvoice = req.file.filename
            }
            const updatedGoodDispatch = req.body;
            const updateDetails = await GoodDispatch.findByIdAndUpdate(goodDispatchId, updatedGoodDispatch, { new: true });
            return updateDetails ? res.status(200).json({ message: 'Data Updated Successfully', status: true }) : res.status(400).json({ message: "Something Went Wrong" })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err, status: false });
    }
}
export const viewGoodDispatch = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getGoodDispatchHierarchy(userId, database)
        // let goodDispatch = await GoodDispatch.find().sort({ sortorder: -1 })
        return (adminDetail.length > 0) ? res.status(200).json({ GoodDispatch: adminDetail, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const viewGoodDispatchById = async (req, res, next) => {
    try {
        let goodDispatch = await GoodDispatch.findById({ _id: req.params.id }).sort({ sortorder: -1 })
        return goodDispatch ? res.status(200).json({ GoodDispatch: goodDispatch, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const deleteGoodDispatch = async (req, res, next) => {
    try {
        const goodDispatch = await GoodDispatch.findByIdAndDelete({ _id: req.params.id })
        return (goodDispatch) ? res.status(200).json({ message: "delete successful", status: true }) : res.status(404).json({ error: "Not Found", status: false });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

export const viewOrderForDeliveryBoy = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Product Not Found", status: false })
        // }
        const goodDispatch = await CreateOrder.find({ database: database, AssignDeliveryBoy: req.params.id, status: { $ne: "Deactive" } }).sort({ sortorder: -1 }).populate({ path: "orderItems.productId", model: "product" }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" }).populate({ path: "warehouseId", model: "warehouse" })
        return (goodDispatch.length > 0) ? res.status(200).json({ OrderList: goodDispatch, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const sendOtp1 = async (req, res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = await Customer.findById({ _id: req.params.id })
        if (!user) {
            return res.status(404).json({ message: "party not found", status: false });
        }
        var mailOptions = {
            from: 'vikramsveltose022@gmail.com',
            to: `${user.email}`,
            subject: 'Delivery Verification OTP',
            html: '<div style={{fontFamily: "Helvetica,Arial,sans-serif",minWidth: 1000,overflow: "auto",lineHeight: 2}}<div style={{ margin: "50px auto", width: "70%", padding: "20px 0" }}><div style={{ borderBottom: "1px solid #eee" }}><a href=""style={{ fontSize: "1.4em",color: "#00466a" textDecoration: "none",fontWeight: 600}}></a></div><p style={{ fontSize: "1.1em" }}>Hi,</p><p>otp</p><h2 value="otp" style={{ background: "#00466a", margin: "0 auto",width: "max-content" padding: "0 10px",color: "#fff",borderRadius: 4}}>' + otp + '</h2><p style={{ fontSize: "0.9em" }}Regards,<br />Distribution Management System</p><hr style={{ border: "none", borderTop: "1px solid #eee" }} /></div</div>',
        };
        user.otpVerify = otp;
        await user.save();
        await transporter.sendMail(mailOptions, (error, info) => {
            (!error) ? response.status(201).json({ message: "otp send successfull", status: true }) : console.log(error) || response.status(400).json({ error: "Something Went Wrong", status: false });
        });
        return res.status(200).json({ message: "otp send successful", status: true })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}
export const updateOrderStatusByDeliveryBoy = async (req, res) => {
    try {
        let CNUpload
        if (req.file) {
            req.body.CNUpload = req.file.filename;
            CNUpload = req.body.CNUpload
        }
        let CNDetails = req.body.CNDetails
        const { status, otp, partyId, orderId, reason, paymentMode } = req.body;
        if (status === "Cancel in processs") {
            const orders = await CreateOrder.findById(orderId);
            if (!orders) {
                return res.status(404).json({ message: "Order Not Found", status: false });
            }
            const user = await User.findById(orders.userId);
            if (!user) {
                return res.status(404).json({ message: "Party Not Found", status: false })
            }
            if (user.otpVerify !== parseInt(otp)) {
                return res.status(400).json({ message: "Incorrect OTP", status: false });
            }
            user.otpVerify = undefined
            let invoiceId = orders.challanNo || orders.invoiceId
            const commonUpdate = { status, paymentMode, CNUpload, invoiceId, CNDetails };
            if (reason) {
                commonUpdate.reason = reason;
            }
            if (orders) {
                Object.assign(orders, commonUpdate);
                await orders.save();
                await user.save();
            }
        } else {
            const user = await Customer.findById(partyId);
            if (!user) {
                return res.status(404).json({ message: "Party Not Found", status: false })
            }
            const orders = await CreateOrder.findById(orderId);
            if (!orders) {
                return res.status(404).json({ message: "Order Not Found", status: false });
            }
            if (user.otpVerify !== parseInt(otp)) {
                return res.status(400).json({ message: "Incorrect OTP", status: false });
            }
            user.otpVerify = undefined
            let invoiceId = orders.challanNo || orders.invoiceId
            const commonUpdate = { status, paymentMode, CNUpload, invoiceId, CNDetails };
            if (reason) {
                commonUpdate.reason = reason;
            }
            if (orders) {
                Object.assign(orders, commonUpdate);
                await orders.save();
                await user.save();
            }
            for (const orderItem of orders.orderItems) {
                const product = await Product.findById({ _id: orderItem.productId });
                if (product) {
                    const warehouse = await Warehouse.findById(product.warehouse)
                    if (warehouse) {
                        const pro = warehouse.productItems.find((item) => item.productId.toString() === orderItem.productId.toString())
                        // pro.currentStock += (orderItem.qty);
                        // product.Opening_Stock += orderItem.qty;
                        // if (pro.currentStock < 0) {
                        //     return res.status(404).json({ message: "Product Out Of Stock", status: false })
                        // }
                        pro.pendingStock -= (orderItem.qty)
                        await warehouse.save();
                        // await product.save()
                    }
                } else {
                    console.error(`Product with ID ${orderItem.productId} not found`);
                }
            }
            if (orders.status === "completed") {
                const particular = "SalesInvoice";
                await ledgerPartyForDebit(orders, particular)
            }
        }
        return res.status(200).json({ message: "Delivery Status Updated Successfully", status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const sendOtp = async (req, res) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const existing = await CreateOrder.findById(req.params.id)
        if (!existing) {
            return res.status(404).json({ message: "order not found", status: false })
        }
        if (req.body.type === "Cancelled") {
            const user = await User.findOne({ _id: existing.userId, status: "Active" })
            if (!user) {
                return res.status(404).json({ message: "user not found", status: false })
            }
            user.otpVerify = otp
            await user.save()
        } else {
            const party = await Customer.findOne({ _id: existing.partyId, status: "Active" })
            if (!party) {
                return res.status(404).json({ message: "party not found", status: false })
            }
            party.otpVerify = otp
            await party.save()
        }
        return res.status(200).json({ message: "otp send successfull!", status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const ViewOtp = async (req, res) => {
    try {
        // const query = { $or: [{ userId }, { partyId }], type: "order" };
        const orderData = await Customer.findById(req.params.id).select('otpVerify')
        if (orderData) {
            return res.status(200).json({ otp: orderData, status: true });
        } else {
            const orderData = await User.findById(req.params.id).select('otpVerify')
            if (orderData) {
                return res.status(200).json({ otp: orderData, status: true });
            }
            return res.status(404).json({ message: 'otp not found', status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const ViewWarehouseByOrder = async (req, res, next) => {
    try {
        const order = await CreateOrder.find({ "orderItems.warehouse": req.params.id, status: "Cancel in processs" })
        if (!order) {
            return res.status(404).json({ message: "warehouse stock not found", status: false })
        }
        return res.status(200).json({ Order: order, status: false })
    }
    catch (err) {
        console.log(err)
    }
}

