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
import { Job } from "../model/CreateJob.model.js";
import { ledgerUserForCredit, ledgerUserForDebit } from "../service/ledger.js";

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
            return res.status(404).json({ message: "Not Found", status: false })
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
        let hours;
        let salary;
        let pfAmount = 0
        const current = new Date()
        const month = current.getMonth()
        const year = current.getFullYear()
        // console.log(year)
        // console.log(month)
        const holiday = await Holiday.find({ month: month.toString() })
        if (holiday.length > 0) {
            totalHoliday = holiday.length
        }
        const user = await User.find({ database: req.params.database, status: "Active" }).populate({ path: "shift", model: "WorkingHour" })
        if (user.length === 0) {
            return res.status(404).json({ message: "User Not Found", status: false })
        }
        for (let id of user) {
            if (id.shift) {
                // console.log(id.shift.shiftName)
                const WorkingHour = await WorkingHours.findOne({ database: req.params.database, shiftName: id.shift.shiftName })
                // console.log(WorkingHour)
                hours = await WorkingHour.totalHours
            } else {
                // console.log(id.firstName)
                continue;
            }
            // console.log("workingHours " + hours)
            const rule = await ApplyRule.findOne({ userId: id._id })
            if (rule) {
                const bonus = await Bonus.findOne({ userId: id._id, months: month, years: year })
                if (!bonus) {
                    // console.log("Bonus Not Found")
                }
                for (let data of rule.employee) {
                    // one-time ,, daily
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
            const data = await totalWorkingHours(id._id)
            totalWorkingDays = await data.attendanceTotal.length;
            if (data.attendanceTotal.length > 0) {
                totalHours = data.totalMonthHours;
                totalOverTime = data.totalOverTime
                if (totalOverTime > 0) {
                    overTimeAmount = ((id.last_job_Salary / 30) / hours) * totalOverTime;
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
                // console.log("leave not found")
            }
            for (let id of leave) {
                // check leave all
                const checkLeave = await LeaveHRM.findById(id.leaveType)
                if (!checkLeave) {
                    // console.log("leave manage not found")
                }
                const yes = (checkLeave.checkStatus === "Paid") ? LeaveCount++ : false
            }
            // console.log(LeaveCount + " " + totalHoliday + " " + hours + " " + totalHours)
            const sunday = await SundayCheck()
            let totalSundayHours = sunday * hours
            // console.log("totalSunday " + totalSundayHours)
            const finalHours = (totalHours + ((LeaveCount + totalHoliday) * hours)) + totalSundayHours
            // console.log("finalHours " + finalHours)
            // console.log(id.pfPercentage + " " + id.firstName)
            // console.log("-----------------------------")
            // console.log("hours " + hours)
            // console.log("salary : " + id.last_job_Salary)
            salary = (((id.last_job_Salary / 30) / hours) * finalHours)
            // console.log(finalHours)
            const CheckSalary = (totalHours === 0) ? salary = 0 : salary;
            // console.log(id.pfPercentage + " " + id.firstName)
            const totalSalary = (CheckSalary * (100 - id.pfPercentage) / 100)
            const pfBalance = CheckSalary - totalSalary
            let latestSalary = {
                database: id.database,
                userId: id._id,
                employeeName: id.firstName + " " + id.lastName,
                panCard: id.Pan_No,
                basicSalary: id.last_job_Salary,
                salaryMonth: month,
                totalSalary: CheckSalary,
                pfAmount: pfBalance,
                totalHours: totalHours,
                DayHours: hours,
                totalSundayHours: totalSundayHours,
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
            pfAmount = 0;
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
        const res = await axios.get(`https://node-hrm.rupioo.com/attendance-calculate-employee/${data}`)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

export const ViewSalary = async (req, res, next) => {
    try {
        const salary = await SetSalary.find({ database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "userId", model: "user" })
        return (salary.length > 0) ? res.status(200).json({ Salary: salary, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const SalaryPaid = async (req, res, next) => {
    try {
        const salary = await SetSalary.findById(req.params.id)
        if (!salary) {
            return res.status(404).json({ message: "Salary Not Found", status: false })
        }
        salary.paidStatus = "paid"
        const updatedSalary = await salary.save()
        if (updatedSalary.paidStatus === "paid") {
            for (const item of salary.employee) {
                if (item?.rule === "ALLOWANCE" || item?.rule === "INCENTIVE" || item?.rule === "BONUS") {
                    const particular = "payment";
                    await ledgerUserForDebit(item, particular)
                } else {
                    const particular = "receipt";
                    await ledgerUserForCredit(item, particular);
                }
            }
        }
        return (updatedSalary) ? res.status(200).json({ Salary: salary, status: true }) : res.status(400).json({ message: "Salary Not Updated", status: false })
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

export const SundayCheck = async () => {
    try {
        const currentMonth = new Date().getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = new Date().getFullYear();
        const daysInPreviousMonth = new Date(year, previousMonth + 1, 0).getDate();
        let sundays = 0;
        const firstDayOfPreviousMonth = new Date(year, previousMonth, 1).getDay();
        for (let day = firstDayOfPreviousMonth === 0 ? 1 : 2; day <= daysInPreviousMonth; day++) {
            const date = new Date(year, previousMonth, day);
            if (date.getDay() === 0) {
                sundays++;
            }
        }
        return sundays
    } catch (err) {
        console.error(err);
    }
};

// For Dashboard
export const HRMCalculate = async (req, res, next) => {
    try {
        let hrm = {
            TotalAbsend: 0,
            TotalPresent: 0,
            TotalSalaryPaid: 0,
            CurrentSalary: 0,
            Vacancy: 0,
            Designation: 0
        };
        const startOfDay = moment().startOf('month').toDate();
        const endOfDay = moment().endOf('month').toDate();
        const jobs = await Job.find({ database: req.params.database, status: "Active" })
        if (jobs.length === 0) {
            // return res.status(404).json({ message: "Job Not Found", status: false })
        }
        const salary = await SetSalary.find({ database: req.params.database, status: "Active", createdAt: { $gte: startOfDay, $lte: endOfDay } })
        if (salary.length === 0) {
            // return res.status(404).json({ message: "Job Not Found", status: false })
        }
        const salarys = await SetSalary.find({ database: req.params.database, status: "Active" })
        if (salarys.length === 0) {
            // return res.status(404).json({ message: "Job Not Found", status: false })
        }
        // const ress = await axios.get(`https://node-hrm.rupioo.com/api/count-attendanceAws/${req.params.database}`)
        // if (ress.data.status) {
        //     for (let item of ress.data.attendanceList) {
        //         hrm.TotalAbsend += item.AbsentDays
        //         hrm.TotalPresent += item.PresentDays
        //     }
        // }
        hrm.TotalSalaryPaid = salarys.reduce((total, item) => total + item.basicSalary, 0)
        hrm.CurrentSalary = salary.reduce((total, item) => total + item.basicSalary, 0)
        hrm.Vacancy = jobs.reduce((total, item) => total + item.numberOfPositions, 0)
        hrm.Designation = jobs.length;
        res.status(200).json({ hrm, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}