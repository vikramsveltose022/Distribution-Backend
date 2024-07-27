import { Incentive } from "../model/incentive.model.js";

export const saveIncentive = async (req, res, next) => {
    try {
        const incentive = await Incentive.create(req.body)
        return incentive ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewIncentive = async (req, res, next) => {
    try {
        const incentive = await Incentive.find({ status: "Active", database: req.params.database }).populate({ path: "employeeName", model: "user" }).populate({ path: "rule", model: "rule" }).sort({ sortorder: -1 })
        return (incentive.length > 0) ? res.status(200).json({ Incentive: incentive, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewIncentiveById = async (req, res, next) => {
    try {
        const incentive = await Incentive.findById(req.params.id).populate({ path: "employeeName", model: "user" }).populate({ path: "rule", model: "rule" })
        return incentive ? res.status(200).json({ Incentive: incentive, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteIncentive = async (req, res, next) => {
    try {
        const incentive = await Incentive.findById(req.params.id)
        if (!incentive) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        incentive.status = "Deactive"
        await incentive.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedIncentive = async (req, res, next) => {
    try {
        const incentive = await Incentive.findById(req.params.id)
        if (!incentive) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Incentive.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}