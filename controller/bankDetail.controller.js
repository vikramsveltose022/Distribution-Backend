import { BankDetail } from "../model/bankDetails.model.js";

export const saveBankDetail = async (req, res) => {
    try {
        const bank = await BankDetail.create(req.body)
        return bank ? res.status(200).json({ message: "save successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}
export const ViewBankDetail = async (req, res, next) => {
    try {
        // const userId = req.params.id;
        const database = req.params.database;
        let bank = await BankDetail.find({ database: database, status: "Active" }).sort({ sortorder: -1 }).populate({ path: "userId", model: "user" });
        return bank ? res.status(200).json({ BankDetail: bank, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const ViewBankDetailById = async (req, res, next) => {
    try {
        let bank = await BankDetail.findById({ _id: req.params.id }).populate({ path: "userId", model: "user" })
        return bank ? res.status(200).json({ BankDetail: bank, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteBankDetail = async (req, res, next) => {
    try {
        const bank = await BankDetail.findById({ _id: req.params.id })
        if (!bank) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        bank.status = "Deactive";
        await bank.save();
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const UpdateBankDetail = async (req, res, next) => {
    try {
        const bankDetailId = req.params.id;
        const existingBankDetail = await BankDetail.findById(bankDetailId);
        if (!existingBankDetail) {
            return res.status(404).json({ message: 'not found', status: false });
        }
        else {
            const updatedData = req.body;
            await BankDetail.findByIdAndUpdate(bankDetailId, updatedData, { new: true });
            return res.status(200).json({ message: 'Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};