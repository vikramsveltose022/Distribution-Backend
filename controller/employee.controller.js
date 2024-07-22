import { Employee } from "../model/createEmployee.model.js";

export const saveEmployeeDetails = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.Image = req.file.filename;
        }
        const employee = await Employee.create(req.body)
        console.log(employee)
        return employee ? res.status(200).json({ message: "employee details saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewEmployeeDetail = async (req, res, next) => {
    try {
        const employee = await Employee.find({}).sort({ sortorder: -1 })
        return (employee.length > 0) ? res.status(200).json({ EmployeeDetail: employee, status: true }) : res.status(404).json({ message: "User Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}