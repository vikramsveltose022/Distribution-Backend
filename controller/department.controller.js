import { Department } from "../model/department.model.js";

export const saveDepartment1 = async (req, res, next) => {
    try {
        let depart = [];
        for (let depart of req.body.Departments) {
            const department = await Department.create(depart);
        }
        return res.status(200).json({ message: "data save successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewDepartment = async (req, res, next) => {
    try {
        const department = await Department.find({ database: req.params.database }).populate({ path: "created_by", model: "user" }).sort({ sortorder: -1 });
        return (department.length > 0) ? res.status(200).json({ Department: department, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UpdateDepartment = async (req, res, next) => {
    try {
        const departmentId = req.params.id;
        const existingDepartment = await Department.findById(departmentId);
        if (!existingDepartment) {
            return res.status(404).json({ error: "department not found", status: false });
        } else {
            const updatedDepartment = req.body;
            await Department.findByIdAndUpdate(departmentId, updatedDepartment, { new: true });
            return res.status(200).json({ message: "Department Updated Successfully", status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const saveDepartment = async (req, res, next) => {
    try {
        for (let departData of req.body.Departments) {
            if (departData.departmentId !== null) {
                const existingDepartment = await Department.findById({ _id: departData.departmentId });
                if (existingDepartment) {
                    await Department.findByIdAndUpdate(departData.departmentId, departData, { new: true });
                } else {
                    const department = await Department.create(departData);
                }
            }
            else {
                const department = await Department.create(departData);
            }
        }
        return res.status(200).json({ message: "Data saved successfully", status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const DeleteDepartment = async (req, res, next) => {
    try {
        const department = await Department.findById({ _id: req.params.id });
        if (!department) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        department.status = "Deactive";
        await department.save();
        return res.status(200).json({ message: "delete successful", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};