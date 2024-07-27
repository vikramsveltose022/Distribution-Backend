import { OfferLetter } from "../model/offerLetter.model.js";

export const saveOfferLetter = async (req, res, next) => {
    try {
        const offer = await OfferLetter.create(req.body)
        return offer ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewOfferLetter = async (req, res, next) => {
    try {
        const offer = await OfferLetter.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "name", model: "jobApplied" })
        return (offer.length > 0) ? res.status(200).json({ OfferLetter: offer, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewOfferLetterById = async (req, res, next) => {
    try {
        const offer = await OfferLetter.findById(req.params.id).populate({ path: "name", model: "jobApplied" })
        return offer ? res.status(200).json({ OfferLetter: offer, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteOfferLetter = async (req, res, next) => {
    try {
        const offer = await OfferLetter.findById(req.params.id)
        if (!offer) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        offer.status = "Deactive"
        await offer.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedOfferLetter = async (req, res, next) => {
    try {
        const offer = await OfferLetter.findById(req.params.id)
        if (!offer) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await OfferLetter.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}