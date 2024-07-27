import { Indicator } from "../model/indicator.model.js";

export const saveIndicator = async (req, res, next) => {
    try {
        const indicator = await Indicator.create(req.body)
        return indicator ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewIndicator = async (req, res, next) => {
    try {
        const indicator = await Indicator.find({ status: "Active", database: req.params.database }).populate({ path: "employeeName", model: "user" }).populate({ path: "rule", model: "rule" }).sort({ sortorder: -1 })
        return (indicator.length > 0) ? res.status(200).json({ Indicator: indicator, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewIndicatorById = async (req, res, next) => {
    try {
        const indicator = await Indicator.findById(req.params.id).populate({ path: "employeeName", model: "user" }).populate({ path: "rule", model: "rule" })
        return indicator ? res.status(200).json({ Indicator: indicator, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteIndicator = async (req, res, next) => {
    try {
        const indicator = await Indicator.findById(req.params.id)
        if (!indicator) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        indicator.status = "Deactive"
        await indicator.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedIndicator = async (req, res, next) => {
    try {
        const indicator = await Indicator.findById(req.params.id)
        if (!indicator) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Indicator.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}