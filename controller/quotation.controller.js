import { Quotation } from "../model/quotation.model.js";
import { User } from "../model/user.model.js";
import { generateInvoice } from "../service/invoice.js";

export const QuotationSaved = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        if (!user) {
            return res.status(401).json({ message: "No user found", status: false });
        } else {
            // const result = await generateInvoice(user.database);
            // if (!result) {
            //     return res.status(404).json({ message: "InvoiceNo. Not Set", status: false })
            // }
            // req.body.userId = user._id;
            // req.body.database = user.database;
            // req.body.invoiceId = result
            const quotation = await Quotation.create(req.body)
            return quotation ? res.status(200).json({ Quotation: quotation, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false })
    }
};
export const ViewQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.find({ database: req.params.database }).populate({ path: 'userId', model: 'user' }).populate({
            path: 'orderItems.productId', model: 'product'
        }).populate({ path: "partyId", model: "customer" }).populate({ path: "bank", model: "BankDetail" }).populate({ path: "signature", model: "userDetail" })
        if (!quotation || quotation.length === 0) {
            return res.status(404).json({ message: "No found", status: false });
        }
        return res.status(200).json({ Quotation: quotation, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewQuotationById = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate({ path: 'userId', model: 'user' }).populate({
            path: 'orderItems.productId', model: 'product'
        }).populate({ path: "partyId", model: "customer" }).populate({ path: "bank", model: "BankDetail" }).populate({ path: "signature", model: "userDetail" })
        if (!quotation) {
            return res.status(404).json({ message: "No found", status: false });
        }
        return res.status(200).json({ Quotation: quotation, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewQuotationByUserId = async (req, res, next) => {
    try {
        const quotation = await Quotation.findOne({ userId: req.params.userId }).populate({ path: 'userId', model: 'user' }).populate({
            path: 'orderItems.productId', model: 'product'
        }).populate({ path: "partyId", model: "customer" }).populate({ path: "bank", model: "BankDetail" }).populate({ path: "signature", model: "userDetail" })
        if (!quotation) {
            return res.status(404).json({ message: "No found", status: false });
        }
        return res.status(200).json({ Quotation: quotation, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const UpdatedQuotation = async (req, res, next) => {
    try {
        const id = req.params.id
        const quotation = await Quotation.findById(id)
        if (quotation) {
            return res.status(404).json({ message: "Quotation No Found", status: false });
        }
        const udpatedDate = req.body;
        await Quotation.findByIdAndUpdate(id, udpatedDate, { new: true })
        return res.status(200).json({ Quotation: quotation, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
