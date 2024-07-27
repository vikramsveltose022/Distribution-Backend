import { Warning } from "../model/warning.model.js";

export const saveWarning = async (req, res, next) => {
    try {
        const warning = await Warning.create(req.body)
        return warning ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewWarning = async (req, res, next) => {
    try {
        const warning = await Warning.find({ status: "Active", database: req.params.database }).populate({ path: "warningByEmployeeName", model: "user" }).populate({ path: "warningToEmployeeName", model: "user" }).sort({ sortorder: -1 })
        return (warning.length > 0) ? res.status(200).json({ warning: warning, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewWarningById = async (req, res, next) => {
    try {
        const warning = await Warning.findById(req.params.id).populate({ path: "warningByEmployeeName", model: "user" }).populate({ path: "warningToEmployeeName", model: "user" })
        return warning ? res.status(200).json({ warning: warning, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteWarning = async (req, res, next) => {
    try {
        const warning = await Warning.findById(req.params.id)
        if (!warning) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        warning.status = "Deactive"
        await warning.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedWarning = async (req, res, next) => {
    try {
        const warning = await Warning.findById(req.params.id)
        if (!warning) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Warning.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}