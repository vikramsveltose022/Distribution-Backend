import axios from "axios";
import { Unit } from "../model/unit.model.js";
import { getUnitHierarchy, getUserHierarchy } from "../rolePermission/permission.js";
import { User } from "../model/user.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";

export const SaveUnit = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const unit = await Unit.create(req.body)
        return unit ? res.status(200).json({ message: "unit save successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
export const ViewUnit = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Unit Not Found", status: false })
        // }
        let unit = await Unit.find({ database: database, status: 'Active' }).sort({ sortorder: -1 })
        return (unit.length > 0) ? res.status(200).json({ Unit: unit, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const ViewUnitById = async (req, res, next) => {
    try {
        let unit = await Unit.findById({ _id: req.params.id }).sort({ sortorder: -1 })
        return unit ? res.status(200).json({ Unit: unit, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteUnit = async (req, res, next) => {
    try {
        const unit = await Unit.findById({ _id: req.params.id })
        if (!unit) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        unit.status = 'Deactive';
        await unit.save();
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const UpdateUnit = async (req, res, next) => {
    try {
        const unitId = req.params.id;
        const existingUnit = await Unit.findById(unitId);
        if (!existingUnit) {
            return res.status(404).json({ error: 'unit not found', status: false });
        }
        else {
            const updatedUnit = req.body;
            await Unit.findByIdAndUpdate(unitId, updatedUnit, { new: true });
            return res.status(200).json({ message: 'Unit Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};