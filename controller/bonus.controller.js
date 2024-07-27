import { Bonus } from "../model/bonus.model.js";
import { ruleCreation } from "../model/ruleCreation.model.js";
import { User } from "../model/user.model.js";

export const bonus = async (req, res, next) => {
    try {
        const check = await ruleCreation.findOne({ title: req.body.type })
        if (!check) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        for (let id of req.body.employees) {
            const employee = await User.findById(id.id)
            if (!employee) {
                continue;
            }
            const current = new Date();
            // if (req.body.months === current.getMonth() + 1) {
            req.body.amount = check.typeValue
            req.body.userId = employee._id.toString()
            req.body.userName = employee.firstName
            req.body.database = employee.database
            // employee.last_job_Salary += parseInt(check.bonusType)
            // console.log(employee.last_job_Salary)
            // await employee.save()
            await Bonus.create(req.body)
            // }
        }
        return res.status(200).json({ message: "apply successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewBonus = async (req, res, next) => {
    try {
        const check = await Bonus.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 })
        if (check.length > 0) {
            return res.status(200).json({ Bonus: check, status: true })
        }
        return res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteBonus = async (req, res, next) => {
    try {
        const bonus = await Bonus.findById(req.params.id)
        if (!bonus) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        bonus.status = "Deactive"
        await bonus.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedBonus = async (req, res, next) => {
    try {
        const bonus = await Bonus.findById(req.params.id)
        if (!bonus) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await Bonus.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewBonusById = async (req, res, next) => {
    try {
        const check = await Bonus.findById(req.params.id)
        if (!check) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ Bonus: check, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const getBonus = async (req, res, next) => {
    try {
        const check = await Bonus.find({ userId: req.params.id })
        if (!check) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ Data: check, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}