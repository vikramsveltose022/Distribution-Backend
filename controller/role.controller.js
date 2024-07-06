import { DashboardTab, Tab } from "../model/createTab.model.js";
import { Role } from "../model/role.model.js";
import { User } from "../model/user.model.js";

export const CreatRole = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.body.createdBy })
        if (!user) {
            return res.status(404).json({ message: "User Not Found", status: false })
        }
        if (req.body.roleId) {
            const role1 = await Role.findById({ roleId: req.body.roleId })
            if (!role1) {
                return res.status(404).json({ message: "id already exist", status: false })
            }
        }
        req.body.database = user.database;
        const role = await Role.create(req.body);
        return res.status(200).json({ Role: role, message: "Role Creation successful", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const getRole = async (req, res, next) => {
    try {
        const database = req.params.database;
        // const roles = await Role.find({}).populate({ path: "createdBy", model: "user" });
        const roles = await Role.find({ database: database }).populate({ path: "createdBy", model: "user" });
        // const role = roles.concat(roles1)
        return res.status(200).json({ Role: roles, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const getRoleById = async (req, res, next) => {
    try {
        const getRole = await Role.findById({ _id: req.params.id }).populate({ path: "createdBy", model: "role" });
        return res.status(200).json({ Role: getRole, status: true });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const updatedRole = async (req, res, next) => {
    try {
        const roleId = req.params.id;
        const existingAccount = await Role.findById(roleId);
        if (!existingAccount) {
            return res.status(404).json({ error: 'role not found', status: false });
        }
        if (req.body.position) {
            return res.status(400).json({ message: "this is not valid request", status: false })
        }
        const role = await Role.findOne({ _id: roleId });
        if (role) {
            role.createdBy = req.body.createdBy || role.createdBy
            role.roleName = req.body.roleName || role.roleName;
            role.desc = req.body.desc || role.desc;
            role.rolePermission = req.body.rolePermission || role.rolePermission;
            await role.save();
        }
        return res.status(200).json({ message: 'Account updated successfully', status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};

export const saveRole = async (req, res, next) => {
    try {
        for (let roleData of req.body.Roles) {
            const existingRole = await Role.findOne({ roleName: roleData.role.roleName, database: roleData.role.database });
            if (existingRole) {
                // console.log(`Role with name ${roleData.role.roleName} already exists.`);
            } else {
                const newRole = await Role.create(roleData.role);
                // console.log(`Role ${newRole.roleName} created successfully.`);
            }
        }
        return res.status(200).json({ message: "role assign successfull!", status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const updatedRoleGloble = async (req, res, next) => {
    try {
        const roles = await Role.find({ roleName: req.body.roleName }).sort({ sortorder: -1 })
        if (!roles.length > 0) {
            return res.status(404).json({ error: 'role not found', status: false });
        }
        for (let id of roles) {
            const roleId = id._id;
            const existingAccount = await Role.findById(roleId);
            if (!existingAccount) {
                return res.status(404).json({ error: 'role not found', status: false });
            }
            if (req.body.position) {
                return res.status(400).json({ message: "this is not valid request", status: false })
            }
            const role = await Role.findOne({ _id: roleId });
            if (role) {
                role.createdBy = req.body.createdBy || role.createdBy
                role.roleName = req.body.roleName || role.roleName;
                role.desc = req.body.desc || role.desc;
                role.rolePermission = req.body.rolePermission || role.rolePermission;
                await role.save();
            }
        }
        return res.status(200).json({ message: 'Account updated successfully', status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};

export const saveTabs = async (req, res, next) => {
    try {
        const user = await Tab.findOne({ userId: req.body.userId })
        if (user) {
            for (let item of req.body.tab) {
                const existingId = await user.tab.find((items) => items.id === item.id)
                if (existingId) {
                    existingId.title = item.title || existingId.title;
                    existingId.type = item.type || existingId.type;
                    existingId.icon = item.icon || existingId.icon;
                    existingId.navLink = item.navLink || existingId.navLink;
                } else {
                    user.tab.push(item)
                }
            }
            await user.save();
        }
        const tab = await Tab.create(req.body)
        return res.status(200).json({ message: "data save successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewTab = async (req, res, next) => {
    try {
        const tab = await Tab.findOne({ userId: req.params.id }).sort({ sortorder: -1 })
        return (tab) ? res.status(200).json({ Tab: tab, status: true }) : res.status(404).json({ message: "Tab Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const saveDashboardTabs = async (req, res, next) => {
    try {
        const user = await DashboardTab.findOne({ userId: req.body.userId })
        if (user) {
            for (let item of req.body.tab) {
                const existingId = await user.tab.find((items) => items.key === item.key)
                if (existingId) {
                    // existingId.key = item.key || existingId.key;
                    existingId.value = item.value || existingId.value;
                    existingId.Name = item.Name || existingId.Name;
                    existingId.show = item.show || existingId.show;
                } else {
                    user.tab.push(item)
                }
            }
            await user.save();
        }
        const tab = await DashboardTab.create(req.body)
        return res.status(200).json({ message: "data save successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewDashboardTab = async (req, res, next) => {
    try {
        const tab = await DashboardTab.findOne({ userId: req.params.id }).sort({ sortorder: -1 })
        return (tab) ? res.status(200).json({ Tab: tab, status: true }) : res.status(404).json({ message: "Tab Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteRole = async (req, res, next) => {
    try {
        const { database } = req.body;
        if (!database) {
            return res.status(400).json({ message: "Database field is required", status: false });
        }
        await Role.deleteMany({ database });
        return res.status(200).json({ message: "Deleted successfully!", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};