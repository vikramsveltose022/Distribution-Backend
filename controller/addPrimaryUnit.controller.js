import { PrimaryUnit } from "../model/addPrimaryUnit.model.js";
import { User } from "../model/user.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";

export const SavePrimaryUnit = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const unit = await PrimaryUnit.create(req.body);
        return unit ? res.status(200).json({ message: "primary unit save successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
export const ViewPrimaryUnit = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        if (!adminDetail.length > 0) {
            return res.status(404).json({ error: "Unit Not Found", status: false })
        }
        let unit = await PrimaryUnit.find({ database: database }).sort({ sortorder: -1 })
        return unit ? res.status(200).json({ PrimaryUnit: unit, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

// export const Calculate = async (req, res) => {
//     try {
//         const { percentage, orderItems } = req.body

//         orderItems.forEach((item) => {
//             item.percentagePrice = (item.price * percentage) / 100;
//         });
//         const totalIncludingPercentage = orderItems.reduce((total, item) => {
//             return total + (item.percentagePrice) * item.qty;
//         }, 0);
//         const response = orderItems.map((item) => ({
//             productId: item.productId,
//             price: item.price,
//             qty: item.qty,
//             chargedAmount: (item.percentagePrice) * item.qty,
//         }));

//         return res.json({
//             percentage,
//             totalIncludingPercentage,
//             orderItemsCharges: response,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }