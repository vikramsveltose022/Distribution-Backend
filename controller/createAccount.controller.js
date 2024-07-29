import { CreateAccount } from "../model/createAccount.model.js";

export const SaveCreateAccount = async (req, res, next) => {
    try {
        let existingData = [];
        if (req.body.CreateAccount.length === 0) {
            return res.status(404).json({ message: "Bad Request", status: false });
        }
        for (const item of req.body.CreateAccount) {
            const created = await CreateAccount.create(item);
            existingData.push(created);
        }
        return (existingData.length > 0) ? res.status(200).json({ message: "Data Saved Successfully!", status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewCreateAccount = async (req, res, next) => {
    try {
        const account = await CreateAccount.find({ database: req.params.database, status: "Active" })
        if (account.length === 0) {
            return res.status(400).json({ message: "Expenses Not Found", status: false });
        }
        return res.status(200).json({ Expenses: account, status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewCreateAccountById = async (req, res, next) => {
    try {
        const account = await CreateAccount.findById(req.params.id)
        return account ? res.status(200).json({ Expenses: account, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const DeleteCreateAccount = async (req, res, next) => {
    try {
        const account = await CreateAccount.findById(req.params.id)
        if (!account) {
            return res.status(404).json({ message: "Expenses Not Found", status: false })
        }
        account.status = "Deactive"
        await account.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UpdatedCreateAccount = async (req, res, next) => {
    try {
        const account = await CreateAccount.findById(req.params.id)
        if (!account) {
            return res.status(404).json({ message: "Expenses Not Found", status: false })
        }
        const updatedData = req.body;
        await CreateAccount.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
