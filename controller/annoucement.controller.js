import { Annoucement } from "../model/annoucement.model.js";

export const saveAnnoucement = async (req, res, next) => {
    try {
        const annoucement = await Annoucement.create(req.body)
        return annoucement ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAnnoucement = async (req, res, next) => {
    try {
        const annoucement = await Annoucement.find({ status: "Active", database: req.params.database }).populate({ path: "employeeName.id", model: "user" }).populate({ path: "branch", model: "jobBatch" }).sort({ sortorder: -1 })
        return (annoucement.length > 0) ? res.status(200).json({ Annoucement: annoucement, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewAnnoucementById = async (req, res, next) => {
    try {
        const annoucement = await Annoucement.findById(req.params.id).populate({ path: "employeeName.id", model: "user" }).populate({ path: "branch", model: "jobBatch" })
        return annoucement ? res.status(200).json({ Annoucement: annoucement, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteAnnoucement = async (req, res, next) => {
    try {
        const annoucement = await Annoucement.findById(req.params.id)
        if (!annoucement) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        annoucement.status = "Deactive"
        await annoucement.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedAnnoucement = async (req, res, next) => {
    try {
        const annoucement = await Annoucement.findById(req.params.id)
        if (!annoucement) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Annoucement.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}