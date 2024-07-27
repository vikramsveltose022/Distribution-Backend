import { Appraisal } from "../model/appraisal.model.js";

export const saveAppraisal = async (req, res, next) => {
    try {
        const appraisal = await Appraisal.create(req.body)
        return appraisal ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAppraisal = async (req, res, next) => {
    try {
        const appraisal = await Appraisal.find({ status: "Active", database: req.params.database }).populate({ path: "empName", model: "user" }).populate({ path: "rule", model: "rule" }).sort({ sortorder: -1 })
        return (appraisal.length > 0) ? res.status(200).json({ Appraisal: appraisal, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAppraisalById = async (req, res, next) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id).populate({ path: "empName", model: "user" }).populate({ path: "rule", model: "rule" })
        return appraisal ? res.status(200).json({ Appraisal: appraisal, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteAppraisal = async (req, res, next) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id)
        if (!appraisal) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        appraisal.status = "Deactive"
        await appraisal.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedAppraisal = async (req, res, next) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id)
        if (!appraisal) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Appraisal.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}