import { Resignation } from "../model/resignation.model.js";

export const saveResignation = async (req, res, next) => {
    try {
        const resignation = await Resignation.create(req.body)
        return resignation ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewResignation = async (req, res, next) => {
    try {
        const resignation = await Resignation.find({ status: "Active", database: req.params.database }).populate({ path: "employeeName", model: "user" }).sort({ sortorder: -1 })
        return (resignation.length > 0) ? res.status(200).json({ Resignation: resignation, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewResignationById = async (req, res, next) => {
    try {
        const resignation = await Resignation.findById(req.params.id).populate({ path: "employeeName", model: "user" })
        return resignation ? res.status(200).json({ Resignation: resignation, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteResignation = async (req, res, next) => {
    try {
        const resignation = await Resignation.findById(req.params.id)
        if (!resignation) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        resignation.status = "Deactive"
        await resignation.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedResignation = async (req, res, next) => {
    try {
        const resignation = await Resignation.findById(req.params.id)
        if (!resignation) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Resignation.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}