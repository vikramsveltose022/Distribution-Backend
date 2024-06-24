import { Salary } from "../model/salary.model.js";

export const saveSalary = async (req, res, next) => {
    try {
        const salary = await Salary.create(req.body)
        return salary ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewSalary = async (req, res, next) => {
    try {
        const salary = await Salary.find({ status: "Active",database:req.params.database }).sort({ sortorder: -1 })
        return (salary.length > 0) ? res.status(200).json({ Salary: salary, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewSalaryById = async (req, res, next) => {
    try {
        const salary = await Salary.findById(req.params.id)
        return salary ? res.status(200).json({ Salary: salary, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteSalary = async (req, res, next) => {
    try {
        const salary = await Salary.findById(req.params.id)
        if (!salary) {
            return res.status(404).json({ message: "Not Fount", status: false })
        }
        salary.status = "Deactive"
        await salary.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedSalary = async (req, res, next) => {
    try {
        const salary = await Salary.findById(req.params.id)
        if (!salary) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Salary.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}