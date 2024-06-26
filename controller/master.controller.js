import { Role } from "../model/role.model.js"
import { User } from "../model/user.model.js"


export const allSuperAdmin = async (req, res, next) => {
    try {
        const superAdmin = await Role.find({ roleName: "SuperAdmin" }).sort({ sortorder: -1 }).select('_id')
        if (!superAdmin) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        // const user = await User.find({ rolename: superAdmin._id }).sort({ sortorder: -1 })
        // return user.length > 0 ? res.status(200).json({ SuperAdmin: user, status: true }) : res.status(404).json({ message: "Not Found", status: false })
        let allSuperAdmin = []
        for (let id of superAdmin) {
            const superAdmin = await User.find({ rolename: id._id }).populate({ path: "subscriptionPlan", model: "subscription" }).sort({ sortorder: -1 })
            if (superAdmin.length > 0) {
                allSuperAdmin.push(superAdmin)
            }
        }
        return (allSuperAdmin.length > 0) ? res.status(200).json({ SuperAdmin: allSuperAdmin.flat(), status: true }) : res.status(404).json({ message: "Not Found", status: false })
        // let allSuperAdmin = []
        // for (let user of superAdmin) {
        //     const superAdmin = await User.find({ rolename: user._id }).sort({ sortorder: -1 })
        //     if (superAdmin.length > 0) {
        //         allSuperAdmin.push(superAdmin)
        //     }
        // }
        // const user = await User.find({ position: 1 }).sort({ sortorder: -1 })
        // const allSuperAdmin1 = (allSuperAdmin.length > 0) ? allSuperAdmin : user;
        // return res.status(200).json({ SuperAdmin: allSuperAdmin1.flat(), status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const createSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        return user ? res.status(200).json({ message: "Data Save Successfully", User: user, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const CreateSuperAdminRole = async (req, res, next) => {
    try {
        const role = await Role.create(req.body);
        return res.status(200).json({ Role: role, message: "Role Creation successfull", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const getRole = async (req, res, next) => {
    try {
        const roles = await Role.find({ createdBy: req.params.id, database: "" }).populate({ path: "createdBy", model: "user" });
        return res.status(200).json({ Role: roles, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const allSalesPerson = async (req, res, next) => {
    try {
        const role = await Role.findOne({ $and: [{ roleName: { $regex: '.*sales Person.*', $options: 'i' } }, { database: "" }] })
        if (!role) {
            return res.status(404).json({ message: "this role not defined", status: false })
        }
        const roleId = role._id.toString();
        console.log(roleId)
        const salesPerson = await User.find({ rolename: roleId }).sort({ sortorder: -1 })
        console.log(salesPerson)
        return salesPerson ? res.status(200).json({ salesPerson: salesPerson, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}