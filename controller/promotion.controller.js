import { Activity } from "../model/createActivity.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { Promotion } from "../model/promotion.model.js";
import { User } from "../model/user.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";

export const SaveActivity = async (req, res, next) => {
    try {
        const existingActivity = await Activity.find({ status: "Active" }).sort({ sortorder: -1 });
        if (existingActivity.length === 0) {
            const no = 1;
            req.body.Code = `PA24-25${no.toString().padStart(4, '0')}`;
        } else {
            const existCode = existingActivity[existingActivity.length - 1].Code;
            const latestCode = parseInt(existCode.slice(7)) + 1;
            const paddedCode = latestCode.toString().padStart(4, '0');
            req.body.Code = `PA24-25${paddedCode}`;
        }
        const newActivity = await Activity.create(req.body)
        return (newActivity) ? res.status(200).json({ message: "Save Successfull", status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error", status: false })
    }
}
export const ViewActivity = async (req, res, next) => {
    try {
        const database = req.params.database;
        const activity = await Activity.find({ database: database, status: "Active" }).sort({ sortorder: -1 })
        return (activity.length > 0) ? res.status(200).json({ Activity: activity, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewActivityById = async (req, res, next) => {
    try {
        const activity = await Activity.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ message: "Activity No found", status: false });
        }
        return res.status(200).json({ Activity: activity, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const UpdatedActivity = async (req, res, next) => {
    try {
        const id = req.params.id
        const activity = await Activity.findById(id)
        if (!activity) {
            return res.status(404).json({ message: "Activity No Found", status: false });
        }
        const udpatedDate = req.body;
        req.body.Code = undefined
        await Activity.findByIdAndUpdate(id, udpatedDate, { new: true })
        return res.status(200).json({ message: "activity updated successfull", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const deleteActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ message: "Activity Not Found", status: false })
        }
        activity.status = "Deactive"
        await activity.save();
        return res.status(200).json({ message: "activity delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const SavePromotion = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const promotion = await Promotion.create(req.body);
        return promotion ? res.status(200).json({ Promotion: promotion, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewPromotion = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Product Not Found", status: false })
        // }
        const promotion = await Promotion.find({ database: database, status: "Active" }).populate({ path: "activityId", model: "activity" }).sort({ sortorder: -1 })
        return (promotion.length > 0) ? res.status(200).json({ Promotion: promotion, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewPromotionById = async (req, res, next) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
        if (!promotion) {
            return res.status(404).json({ message: "Promotion No found", status: false });
        }
        return res.status(200).json({ Promotion: promotion, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const UpdatedPromotion = async (req, res, next) => {
    try {
        const id = req.params.id
        const promotion = await Promotion.findById(id)
        if (!promotion) {
            return res.status(404).json({ message: "Promotion No Found", status: false });
        }
        const udpatedDate = req.body;
        await Promotion.findByIdAndUpdate(id, udpatedDate, { new: true })
        return res.status(200).json({ message: "promotion updated successfull", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const deletePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
        if (!promotion) {
            return res.status(404).json({ message: "Promotion Not Found", status: false })
        }
        promotion.status = "Deactive"
        await promotion.save();
        return res.status(200).json({ message: "promotion delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const PromotionApply = async (req, res, next) => {
    try {
        const partyId = req.body.partyId
        const dates = new Date()
        // const dates = new Date(date);
        const startOfDay = new Date(dates);
        const endOfDay = new Date(dates);
        startOfDay.setUTCHours(0, 0, 0, 0);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const existPromotion = await Promotion.find({ database: req.params.database, status: "Active" })
        if (existPromotion.length === 0) {
            return res.status(404).json({ message: "Promotion Not Found", status: false })
        }
        for (let item of existPromotion) {
            if (item.productWise.length > 0) {
                const status = await CheckDate(item.activityId)
                status === true ? await ProductWise(item.productWise, partyId) : console.log("Not Found")
            } else if (item.amountWise.length > 0) {
                const status = await CheckDate(item.activityId)
                status === true ? await AmountWise(item.amountWise[0], partyId) : console.log("Amount Not Found")
            } else if (item.percentageWise.length > 0) {
                const status = await CheckDate(item.activityId)
                status === true ? await PercentageWise(item.percentageWise[0], partyId) : console.log(" Percentage Not Found")
            }
        }
        return res.status(200).json({ messge: "success", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error", status: false })
    }
}
export const ProductWise = async (product, partyId) => {
    try {
        let totalQty = 0
        const startOfDay = new Date(product.startDate);
        const endOfDay = new Date(product.endDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const existOrder = await CreateOrder.find({ partyId: partyId, date: { $gte: startOfDay, $lte: endOfDay } })
        if (existOrder.length === 0) {
            console.log("Order Not Found")
        } else {
            for (let item of existOrder) {
                item.orderItems.forEach((item) => {
                    if (item.productId.toString() === product.productId.toString()) {
                        console.log("calling")
                        totalQty += item.qty;
                    }
                })
            }
            if (product.productQty < totalQty) {
                console.log("Gift.............")
            }
        }
        console.log("Product-Wise")
    }
    catch (err) {
        console.log(err);
    }
}
export const AmountWise = async (amount) => {
    try {
        console.log("Amount-Wise")
    }
    catch (err) {
        console.log(err);
    }
}
export const PercentageWise = async (percentage) => {
    try {
        console.log("Percentage wise")
    }
    catch (err) {
        console.log(err);
    }
}
export const CheckDate = async (body) => {
    try {
        const currentDate = new Date();
        const date1 = new Date(body.FromDate);
        const date2 = new Date(body.ToDate);
        if (date1 <= currentDate && currentDate <= date2) {
            return true
        } else {
            return false
        }
    }
    catch (err) {
        console.log(err);
    }
}