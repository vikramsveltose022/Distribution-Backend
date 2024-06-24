import { Subscription } from "../model/subscription.model.js";

export const SaveDetails = async (req, res, next) => {
    try {
        const subscription = await Subscription.create(req.body)
        return subscription ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "Bad Request", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewDetails = async (req, res, next) => {
    try {
        const subscription = await Subscription.find({ status: "Active" }).sort({ sortorder: -1 })
        return subscription.length ? res.status(200).json({ Subscription: subscription, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewDetailById = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
        return subscription ? res.status(200).json({ Subscription: subscription, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const DeleteDetail = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
        if (subscription) {
            subscription.status = "Deactive";
            await subscription.save();
            return res.status(200).json({ message: "delete successfull", status: true })
        }
        return res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UpdateDetails = async (req, res, next) => {
    try {
        const sub = await Subscription.findById(req.params.id)
        if (!sub) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}