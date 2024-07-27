import { OtherCharges } from "../model/otherCharges.model.js";

export const saveOtherCharges = async (req, res, next) => {
    try {
        const otherCharges = await OtherCharges.create(req.body)
        return otherCharges ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewOtherCharges = async (req, res, next) => {
    try {
        const otherCharges = await OtherCharges.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 })
        return (otherCharges.length > 0) ? res.status(200).json({ OtherCharges: otherCharges, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewOtherChargesById = async (req, res, next) => {
    try {
        const otherCharges = await OtherCharges.findById(req.params.id)
        return otherCharges ? res.status(200).json({ OtherCharges: otherCharges, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteOtherCharges = async (req, res, next) => {
    try {
        const otherCharges = await OtherCharges.findById(req.params.id)
        if (!otherCharges) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        otherCharges.status = "Deactive"
        await otherCharges.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedOtherCharges = async (req, res, next) => {
    try {
        const otherCharges = await OtherCharges.findById(req.params.id)
        if (!otherCharges) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await OtherCharges.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}