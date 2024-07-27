import { Termination } from "../model/termination.model.js";

export const saveTermination = async (req, res, next) => {
    try {
        const termination = await Termination.create(req.body)
        return termination ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewTermination = async (req, res, next) => {
    try {
        const termination = await Termination.find({ status: "Active", database: req.params.database }).populate({ path: "employeeName", model: "user" }).sort({ sortorder: -1 })
        return (termination.length > 0) ? res.status(200).json({ Termination: termination, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewTerminationById = async (req, res, next) => {
    try {
        const termination = await Termination.findById(req.params.id).populate({ path: "employeeName", model: "user" })
        return termination ? res.status(200).json({ Termination: termination, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteTermination = async (req, res, next) => {
    try {
        const termination = await Termination.findById(req.params.id)
        if (!termination) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        termination.status = "Deactive"
        await termination.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedTermination = async (req, res, next) => {
    try {
        const termination = await Termination.findById(req.params.id)
        if (!termination) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Termination.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}