import { DebitNote } from "../model/debitNote.model.js";
import { getDebitNoteHierarchy } from "../rolePermission/RolePermission.js";


export const SaveDebitNote = async (req, res) => {
    try {
        const debit = await DebitNote.create(req.body)
        return debit ? res.status(200).json({ message: "Debit Note Saved Successfull!", status: true }) : res.status(400).json({ message: "Bad Request", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const viewDebitNote = async (req, res, next) => {
    try {
        // const userId = req.params.id;
        // const adminDetail = await getDebitNoteHierarchy(userId);
        const debit = await DebitNote.find({ database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" })
        return (debit.length > 0) ? res.status(200).json({ DebitNote: debit, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewDebitNoteById = async (req, res) => {
    const { orderId, userId, productId } = req.body;
    try {
        const query = { $or: [{ orderId }, { userId }, { 'productItems.productId': productId }] };
        const orderData = await DebitNote.findOne(query).populate({ path: "userId", model: "user" }).populate({ path: "productItems.productId", model: "product" })
        if (orderData) {
            return res.status(200).json({ DebitNote: orderData, status: true });
        } else {
            return res.status(404).json({ error: 'this DebitNote Order not found', status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};