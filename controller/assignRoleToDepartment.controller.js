import { AssignRole } from "../model/assignRoleToDepartment.model.js";
import { Role } from "../model/role.model.js";
import { User } from "../model/user.model.js";


export const saveAssignRole = async (req, res, next) => {
    try {
        const { roles } = req.body;
        if (roles) {
            for (let id of roles) {
                const role = await Role.findById({ _id: id.roleId });
                role.assign = 1;
                await role.save();
            }
        }
        const checkDepartment = await AssignRole.findOne({ departmentName: req.body.departmentName });
        if (checkDepartment) {
            for (let role of req.body.roles) {
                checkDepartment.roles.push(role);
            }
            const department = await checkDepartment.save();
            return res.status(200).json({ Department: department, status: true });
        } else {
            const department = await AssignRole.create(req.body);
            return res.status(200).json({ Department: department, status: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const viewAssignRole = async (req, res, next) => {
    try {
        const department = await AssignRole.find({ database: req.params.database }).populate({ path: "created_by", model: "user" }).populate({ path: "departmentName", model: "department" }).populate({ path: "roles.roleId", model: "role" }).sort({ sortorder: -1 });
        return (department.length > 0) ? res.status(200).json({ Department: department, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateAssignRole = async (req, res, next) => {
    try {
        if (req.body.deleteRole && req.body.deleteRole.length > 0) {
            for (let id of req.body.deleteRole) {
                const role = await Role.findById({ _id: id.roleId });
                role.assign = 0;
                await role.save();
                // const result = await Role.updateMany({ _id: id.roleId },{ $pull: { shift: shiftToDelete } });
            }
        }
        const updatedAssignRole = await AssignRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return updatedAssignRole ? res.status(200).json({ AssignRole: updatedAssignRole, status: true }) : res.status(404).json({ message: "AssignRole not found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewAssignRoleById = async (req, res, next) => {
    try {
        let assignRole = await AssignRole.findById({ _id: req.params.id }).sort({ sortorder: -1, });
        return assignRole ? res.status(200).json({ AssignRole: assignRole, status: true }) : res.status(404).json({ error: "Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

// userId
export const saveAssignRole1 = async (req, res, next) => {
    try {
        const { roles } = req.body;
        if (roles) {
            for (let id of roles) {
                const role = await Role.findById({ _id: id.roleId });
                role.assign.push(req.body.created_by.toString());
                await role.save();
            }
        }
        const checkDepartment = await AssignRole.findOne({ departmentName: req.body.departmentName });
        if (checkDepartment) {
            for (let role of req.body.roles) {
                checkDepartment.roles.push(role);
            }
            const department = await checkDepartment.save();
            return res.status(200).json({ Department: department, status: true });
        } else {
            const department = await AssignRole.create(req.body);
            return res.status(200).json({ Department: department, status: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const viewAssignRole1 = async (req, res, next) => {
    try {
        const department = await AssignRole.find({ database: req.params.database, userId: req.params.id }).populate({ path: "created_by", model: "user" }).populate({ path: "departmentName", model: "department" }).populate({ path: "roles.roleId", model: "role" }).sort({ sortorder: -1 });
        return (department.length > 0) ? res.status(200).json({ Department: department, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateAssignRole1 = async (req, res, next) => {
    try {
        if (req.body.deleteRole && req.body.deleteRole.length > 0) {
            for (let id of req.body.deleteRole) {
                const result = await Role.updateMany({ _id: id.roleId }, { $pull: { shift: req.body.created_by } });
            }
        }
        const updatedAssignRole = await AssignRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return updatedAssignRole ? res.status(200).json({ AssignRole: updatedAssignRole, status: true }) : res.status(404).json({ message: "AssignRole not found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};