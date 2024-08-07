import { CreditNote } from "../model/creditNote.model.js";
import { DebitNote } from "../model/debitNote.model.js";
import { getCreditNoteHierarchy } from "../rolePermission/RolePermission.js";

export const viewCreateNote = async (req, res, next) => {
    try {
        // const userId = req.params.id;
        // const adminDetail = await getCreditNoteHierarchy(userId);
        const credit = await CreditNote.find({ database: req.params.database }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "partyId", model: "customer" })
        return (credit.length > 0) ? res.status(200).json({ CreditNote: credit, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const viewCreditNoteById = async (req, res) => {
    const { orderId, userId, productId } = req.body;
    try {
        const query = { $or: [{ orderId }, { userId }, { 'productItems.productId': productId }] };
        const orderData = await CreditNote.findOne(query).populate({ path: "productItems.productId", model: "product" }).populate({ path: "partyId", model: "customer" })
        if (orderData) {
            return res.status(200).json({ CreditNote: orderData, status: true });
        } else {
            return res.status(404).json({ error: 'Order not found', status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const CreditDebitNoteReport = async (req, res) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        const credit = await CreditNote.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "orderId", model: "createOrder" })
        const debit = await DebitNote.find(targetQuery).sort({ sortorder: -1 })
        const cdnr = credit.concat(debit)
        return res.status(200).json({ CDNR: cdnr, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const SaveCreditNote = async (req, res) => {
    try {
        const credit = await CreditNote.create(req.body)
        return credit ? res.status(200).json({ message: "Credit Note Saved Successfull!", status: true }) : res.status(400).json({ message: "Bad Request", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};