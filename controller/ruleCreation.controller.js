import axios from "axios";
import { Bonus } from "../model/bonus.model.js";
import { Holiday } from "../model/holiday.model.js";
import { LeaveHRM } from "../model/leaveHRM.model.js";
import { LeaveManage } from "../model/leaveMange.model.js";
import { ruleCreation } from "../model/ruleCreation.model.js";
import { User } from "../model/user.model.js";
import { WorkingHours } from "../model/workingHours.model.js";
import { SetSalary } from "../model/setSalary.model.js";
import { ApplyRule } from "../model/rule.applied.model.js";
import moment from "moment";

export const saveRule = async (req, res, next) => {
    try {
        const rule = await ruleCreation.create(req.body)
        return rule ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewRule = async (req, res, next) => {
    try {
        const rule = await ruleCreation.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (rule.length > 0) ? res.status(200).json({ Rule: rule, status: true }) : res.status(404).json({ message: "Not Found", status: false })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewRuleById = async (req, res, next) => {
    try {
        const rule = await ruleCreation.findById(req.params.id)
        return rule ? res.status(200).json({ Rule: rule, status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteRule = async (req, res, next) => {
    try {
        const rule = await ruleCreation.findById(req.params.id)
        if (!rule) {
            return res.status(404).json({ message: "Not Fount", status: false })
        }
        rule.status = "Deactive"
        await rule.save();
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedRule = async (req, res, next) => {
    try {
        const rule = await ruleCreation.findById(req.params.id)
        if (!rule) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await ruleCreation.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}


export const setSalary = async (req, res, next) => {
    try {
        const month = "March";
        const workingDays = 26;
        const overTime = 4;
        const employee = await User.findById('65f1531de48be21658df8c74');
        if (!employee) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        let NetSalary = employee.last_job_Salary;
        const salary = [];
        for (let data of employee.setRule) {
            const check = await ruleCreation.findOne({ title: data.title });
            if (check) {
                let amount = (check.type === "percentage") ? employee.last_job_Salary * check.typeValue / 100 : check.typeValue;
                let rule = {
                    title: check.title,
                    rule: check.rule,
                    type: check.type,
                    typeNumber: check.typeValue,
                    period: check.period,
                    amount: amount
                };
                if (check.rule === "ALLOWANCE" || check.rule === "INCENTIVE" || check.rule === "BONUS") {
                    NetSalary += amount;
                } else {
                    NetSalary -= amount;
                }
                salary.push(rule);
            }
        }
        const overTimeAmount = ((employee.last_job_Salary / 30) / 9) * overTime;
        const data = {
            employeeName: `${employee.firstName} ${employee.lastName}`,
            GrossSalary: employee.last_job_Salary,
            month: month,
            overTime: overTimeAmount.toFixed(2),
            NetSalary: (NetSalary + overTimeAmount).toFixed(2),
            workingDays: workingDays
        };
        const latestSalaryClip = [salary, data];
        return res.status(200).json({ Salary: latestSalaryClip, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
// right
export const Salary = async (req, res, next) => {
    try {
        const previousMonthStart = moment().subtract(1, 'months').startOf('month').toDate();
        const previousMonthEnd = moment().subtract(1, 'months').endOf('month').toDate();
        let LeaveCount = 0;
        let totalHoliday = 0;
        let latest = [];
        let employee = [];
        let totalHours = 0;
        let totalOverTime = 0;
        let overTimeAmount = 0;
        let totalWorkingDays = 0;
        let bonusAmount = 0;
        const hours = await WorkingHours.findOne({ database: req.params.database })
        // console.log(hours.totalHours)
        const current = new Date()
        const month = current.getMonth()
        // console.log(month)
        const holiday = await Holiday.find({ month: month.toString() })
        if (holiday.length > 0) {
            totalHoliday = holiday.length
        }
        const user = await User.find({ database: req.params.database, status: "Active" })
        if (user.length === 0) {
            return res.status(404).json({ message: "User Not Found", status: false })
        }
        for (let id of user) {
            const rule = await ApplyRule.findOne({ userId: id._id })
            if (rule) {
                const bonus = await Bonus.findOne({ userId: id._id, months: month })
                if (!bonus) {
                    console.log("Bonus Not Found")
                }
                for (let data of rule.employee) {
                    if (data.period === "monthly") {
                        employee.push(data)
                    }
                    if (bonus) {
                        if (data.rule === "BONUS") {
                            bonusAmount = data.amount
                        }
                    }
                }
            }
            // if (rule) {
            //     employee = rule.employee
            // }
            const data = await totalWorkingHours(id.Pan_No)
            totalWorkingDays = await data.attendanceTotal.length;
            if (data.attendanceTotal.length > 0) {
                totalHours = data.totalMonthHours;
                totalOverTime = data.totalOverTime
                if (totalOverTime > 0) {
                    overTimeAmount = ((id.last_job_Salary / 30) / hours.totalHours) * totalOverTime;
                }
            }
            // manage leave check employee
            // const leave = await LeaveManage.find({ employee: id._id })
            const leave = await LeaveManage.find({
                employee: id._id,
                $or: [{ startDate: { $gte: previousMonthStart, $lte: previousMonthEnd } },
                { endDate: { $gte: previousMonthStart, $lte: previousMonthEnd } }]
            });
            if (leave.length === 0) {
                console.log("not found")
            }
            for (let id of leave) {
                // check leave all
                const checkLeave = await LeaveHRM.findById(id.leaveType)
                if (!checkLeave) {
                    console.log("not found")
                }
                const yes = (checkLeave.checkStatus === "Paid") ? LeaveCount++ : false
            }
            const finalHours = (totalHours + ((LeaveCount + totalHoliday) * hours.totalHours))
            const salary = (((id.last_job_Salary / 30) / hours.totalHours) * finalHours)
            // console.log(finalHours)
            // return salary
            let latestSalary = {
                database: id.database,
                userId: id._id,
                employeeName: id.firstName + " " + id.lastName,
                panCard: id.Pan_No,
                basicSalary: id.last_job_Salary,
                salaryMonth: month,
                totalSalary: salary,
                totalHours: totalHours,
                totalWorkingDays: totalWorkingDays,
                overTimeAmount: overTimeAmount,
                bonusAmount: bonusAmount,
                employee: employee
            }
            await SetSalary.create(latestSalary)
            latest.push(latestSalary)
            employee = []
            totalHours = 0
            totalOverTime = 0
            overTimeAmount = 0
            totalWorkingDays = 0
            bonusAmount = 0;
        }
        return res.send(latest)
    }
    catch (err) {
        console.log(err);
        // return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const totalWorkingHours = async function totalWorkingHours(data) {
    try {
        const res = await axios.get(`https://node-second.rupioo.com/attendance-calculate-employee/${data}`)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

export const ViewSalary = async (req, res, next) => {
    try {
        const salary = await SetSalary.find({ database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "userId", model: "user" })
        return (salary.length > 0) ? res.status(200).json({ Salary: salary, status: true }) : res.status(500).json(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

// for daily salary
export const workingHours = async (req, res, next) => {
    try {
        let hoursSalary = 0;
        const hours = await WorkingHours.findOne({ database: req.params.database })
        // const user = await User.findOne({ Pan_No: req.params.panNo })
        const user = await User.findOne({ $or: [{ Pan_No: req.params.panNo }, { Aadhar_No: req.params.panNo }] });

        if (user && hours) {
            hoursSalary = user.last_job_Salary / (hours.totalHours * 30)
        }
        return (hours && user) ? res.status(200).json({ hours, hoursSalary, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
