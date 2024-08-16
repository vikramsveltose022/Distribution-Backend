import { CustomerGroup } from "../model/customerGroup.model.js";

export const saveCustomerGroup = async (req, res, next) => {
    try {
        if (req.body.id) {
            const existing = await CustomerGroup.findOne({ status: "Active", database: req.body.database, id: req.body.id })
            if (existing) {
                return res.status(404).json({ message: "id already exist", status: false })
            }
        } else {
            return res.status(400).json({ message: "customer group id required", status: false })
        }
        const customerGroup = await CustomerGroup.create(req.body);
        return customerGroup ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewCustomerGroup = async (req, res, next) => {
    try {
        const customerGroup = await CustomerGroup.find({ database: req.params.database }).sort({ sortorder: -1 });
        return res.status(200).json({ CustomerGroup: customerGroup, status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewCustomerGroupById = async (req, res, next) => {
    try {
        let customerGroup = await CustomerGroup.findById({ _id: req.params.id }).sort({
            sortorder: -1
        });
        return customerGroup ? res.status(200).json({ CustomerGroup: customerGroup, status: true }) : res.status(404).json({ error: "Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const DeleteCustomerGroup = async (req, res, next) => {
    try {
        const customerGroup = await CustomerGroup.findById({ _id: req.params.id });
        if (!customerGroup) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        customerGroup.status = "Deactive";
        await customerGroup.save();
        return res.status(200).json({ message: "delete successful", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const updatedCustomerGroup = async (req, res, next) => {
    try {
        const customerGroupId = req.params.id;
        const existingCustomerGroup = await CustomerGroup.findById(customerGroupId);
        if (!existingCustomerGroup) {
            return res.status(404).json({ error: "customerGroup not found", status: false });
        } else {
            const updatedCustomerGroup = req.body;
            await CustomerGroup.findByIdAndUpdate(customerGroupId, updatedCustomerGroup, { new: true });
            return res.status(200).json({ message: "Updated Successfully", status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
