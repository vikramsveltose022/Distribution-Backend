import { DebitNote } from "../model/debitNote.model.js";
import { getDebitNoteHierarchy } from "../rolePermission/RolePermission.js";


export const viewDebitNote = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const adminDetail = await getDebitNoteHierarchy(userId);
        return (adminDetail.length > 0) ? res.status(200).json({ DebitNote: adminDetail, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, status: false })
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


