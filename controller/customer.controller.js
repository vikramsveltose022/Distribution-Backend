import dotenv from "dotenv";
import moment from "moment"
import ExcelJS from 'exceljs'
import Jwt from "jsonwebtoken";
import { Customer } from '../model/customer.model.js';
import { getCustomerHierarchy } from '../rolePermission/RolePermission.js';
import transporter from "../service/email.js";
import { OverDueReport } from "../model/overDue.mode.js";
import { User } from "../model/user.model.js";
import { PaymentDueReport } from "../model/payment.due.report.js";
import { Role } from "../model/role.model.js";
import { UpdateCheckLimit, checkLimit } from "../service/checkLimit.js";
import { CustomerGroup } from "../model/customerGroup.model.js";
import { Receipt } from "../model/receipt.model.js";
import axios from "axios";
dotenv.config();

export const SaveCustomer = async (req, res, next) => {
    try {
        if (req.body.id) {
            const existing = await Customer.findOne({ status: "Active", database: req.body.database, id: req.body.id })
            if (existing) {
                return res.status(404).json({ message: "id already exist", status: false })
            }
        } else {
            return res.status(400).json({ message: "customer id required", status: false })
        }
        if (req.files) {
            let images = [];
            req.files.map(file => {
                if (file.fieldname === "file") {
                    req.body.Photo = file.filename
                }
                else {
                    images.push(file.filename)
                }
            })
            req.body.shopPhoto = images;
        }
        if (req.body.assignTransporter) {
            req.body.assignTransporter = JSON.parse(req.body.assignTransporter)
        }
        if (req.body.limit) {
            req.body.remainingLimit = req.body.limit
        }
        const customer = await Customer.create(req.body)
        return customer ? res.status(200).json({ message: "Data Save Successfully", Customer: customer, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal Server Error", status: false })
    }
}
export const ViewCustomer = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getCustomerHierarchy(userId, database)
        // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        // if (!adminDetail.length > 0) {
        //     return res.status(404).json({ error: "Unit Not Found", status: false })
        // }
        // let customer = await Customer.find({ database: database }).sort({ sortorder: -1 })
        return (adminDetail.length > 0) ? res.status(200).json({ Customer: adminDetail, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const ViewCustomerById = async (req, res, next) => {
    try {
        let customer = await Customer.findById({ _id: req.params.id }).populate({ path: "category", model: "customerGroup" }).populate({ path: "assignTransporter._id", model: "transporter" }).populate({ path: "rolename", model: "role" })
        return customer ? res.status(200).json({ Customer: customer, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById({ _id: req.params.id })
        if (!customer) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        customer.created_by = undefined;
        customer.status = "Deactive";
        await customer.save();
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const DeleteBulkCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.find({ database: req.params.database })
        if (customer.length === 0) {
            return res.status(404).json({ message: "Customer Not Found", status: false })
        }
        for (let id of req.body.customer) {
            const person = await Customer.findById({ _id: id.id });
            if (person) {
                person.created_by = undefined;
                person.status = "Deactive"
                await person.save();
            }
        }
        return res.status(200).json({ message: "Delete Successfull!", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const UpdateCustomer = async (req, res, next) => {
    try {
        if (req.files) {
            let image = [];
            let images = [];
            req.files.map(file => {
                if (file.fieldname === "file") {
                    req.body.Photo = file.filename
                }
                else {
                    images.push(file.filename)
                }
            })
            req.body.shopPhoto = images;
            // req.body.photo = images
        }
        const customerId = req.params.id;
        const existingCustomer = await Customer.findById(customerId);
        if (!existingCustomer) {
            return res.status(404).json({ error: 'customer not found', status: false });
        }
        else {
            if (req.body.assignTransporter) {
                req.body.assignTransporter = JSON.parse(req.body.assignTransporter)
            }
            if (req.body.paymentTerm === existingCustomer.paymentTerm && req.body.paymentTerm !== "cash") {
                if (existingCustomer.limit !== req.body.limit) {
                    const diff = req.body.limit - existingCustomer.limit
                    req.body.remainingLimit = (existingCustomer.remainingLimit || 0 + diff);
                }
            } else {
                if (req.body.paymentTerm !== "cash") {
                    if (req.body.limit) {
                        req.body.remainingLimit = req.body.limit;
                    }
                }
            }
            const updatedCustomer = req.body;
            const existOver = await OverDueReport.findOne({ partyId: customerId, activeStatus: "Active" })
            if (existOver) {
                existOver.lockingAmount = req.body.limit
                await existOver.save()
            }
            await Customer.findByIdAndUpdate(customerId, updatedCustomer, { new: true });
            return res.status(200).json({ message: 'Customer Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const UpdateCustomer1 = async (req, res, next) => {
    try {
        const party = await Customer.find({ database: req.body.database, leadStatusCheck: "false" })
        console.log(party.length)
        // for (let id of party) {
        //     const customer = await Customer.findById(id._id)
        //     customer.leadStatusCheck = "false";
        //     await customer.save()
        // }
        return res.status(200).json({ message: 'Customer Updated Successfully', status: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
//---------------------------------------------------------------
export const SuperAdminList = async (req, res, next) => {
    try {
        let userList = [];
        const { mobileNo } = req.body;
        const existingCustomer = await Customer.find({ mobileNumber: mobileNo });
        if (existingCustomer.length === 0) {
            return res.status(400).json({ message: "Incorrect mobile number.", status: false });
        }
        const roles = await Role.find({ roleName: "SuperAdmin" });
        for (let customer of existingCustomer) {
            for (let role of roles) {
                try {
                    const user = await User.findOne({ rolename: role._id, database: customer.database });
                    if (user) {
                        userList.push(user);
                    }
                } catch (error) {
                    console.error(`Error finding user for customer ${customer._id} and role ${role._id}: ${error}`);
                }
            }
        }
        return res.status(200).json({ SuperAdmin: userList, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const SignInWithMobile = async (req, res, next) => {
    try {
        const { mobileNo } = req.body;
        let existingAccount = await Customer.findOne({ mobileNumber: mobileNo }).populate({ path: "rolename", model: "role", });
        if (!existingAccount) {
            return res.status(400).json({ message: "Incorrect mobile No.", status: false });
        }
        const token = Jwt.sign({ subject: existingAccount.email }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' });
        // await Customer.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
        return res.json({ message: "Login successful", user: { ...existingAccount.toObject(), password: undefined, token }, status: true, });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const SignIn = async (req, res, next) => {
    try {
        const { email, userName, password, latitude, longitude, currentAddress } = req.body;
        let existingAccount = await Customer.findOne({ $or: [{ email }, { userName }] }).populate({ path: "rolename", model: "role", });
        if (!existingAccount) {
            return res.status(400).json({ message: "Incorrect email", status: false });
        }
        if (existingAccount.password !== password) {
            return res.status(400).json({ message: "Incorrect password", status: false });
        }
        const token = Jwt.sign({ subject: existingAccount.email }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' });
        await Customer.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
        return res.json({ message: "Login successful", user: { ...existingAccount.toObject(), password: undefined, token }, status: true, });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
const resetOTP = {};
export const forgetPassword = async (request, response, next) => {
    try {
        const { email } = request.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        resetOTP[email] = otp;
        const user = await Customer.findOne({ email });
        if (!user) {
            return response.status(404).json({ message: "Customer not found" });
        }
        var mailOptions = {
            from: {
                name: "Distribution Management System",
                address: "vikramsveltose022@gmail.com",
            },
            to: email,
            subject: "Password has been reset",
            html:
                '<div style={{fontFamily: "Helvetica,Arial,sans-serif",minWidth: 1000,overflow: "auto",lineHeight: 2}}<div style={{ margin: "50px auto", width: "70%", padding: "20px 0" }}><div style={{ borderBottom: "1px solid #eee" }}><a href=""style={{ fontSize: "1.4em",color: "#00466a" textDecoration: "none",fontWeight: 600}}></a></div><p style={{ fontSize: "1.1em" }}></p><p>The password for your distribution management system account has been successfully reset</p><h2 value="otp" style={{ background: "#00466a", margin: "0 auto",width: "max-content" padding: "0 10px",color: "#fff",borderRadius: 4}}>' +
                otp +
                '</h2><p style={{ fontSize: "0.9em" }}Regards,<br />SoftNumen Software Solutions</p><hr style={{ border: "none", borderTop: "1px solid #eee" }} /></div</div>',
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            !error ? response.status(201).json({ customer: user, message: "send otp on email", status: true }) : console.log(error) || response.json({ error: "something went wrong" });
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: "Internal Server error" });
    }
};
export const otpVerify = async (req, res, next) => {
    try {
        const { otp, email } = req.body;
        if (otp == resetOTP[email]) {
            delete resetOTP[email];
            return res.status(201).json({ message: "otp matched successfully", status: true });
        } else {
            return res.status(400).json({ error: "Invalid otp", status: false });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error...", status: false });
    }
};
export const updatePassword = async (request, response, next) => {
    try {
        const userId = request.params.id;
        if (request.body.password !== request.body.confirmPassword) {
            return response.status(400).json({ error: "Password don't match", status: false });
        } else {
            // request.body.password = await bcrypt.hash(request.body.password, await bcrypt.genSalt(15));
            const user = await Customer.updateMany({ _id: userId }, { password: request.body.password }, { new: true });
            if (user.modifiedCount > 0)
                return response.status(200).json({ Message: "Password Updated success", status: true });
            return response.status(400).json({ Message: "Unauthorized User...", status: false });
        }
    } catch (err) {
        console.log(err);
        return response.status(500).json({ Message: "Internal Server Error...", status: false });
    }
};

export const saveExcelFile11 = async (req, res) => {
    try {
        let code = "code";
        let database = "database"
        const filePath = await req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const headerRow = worksheet.getRow(1);
        const headings = [];
        headerRow.eachCell((cell) => {
            headings.push(cell.value);
        });
        const insertedDocuments = [];
        const existingParts = [];
        const panMobile = [];
        const existingIds = []
        const dataNotExist = []
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                if (heading === 'email' && typeof cellValue === 'object' && 'text' in cellValue) {
                    document[heading] = cellValue.text;
                } else {
                    document[heading] = cellValue;
                }
            }
            document[database] = req.params.database
            if (document.database) {
                const existingId = await Customer.findOne({ id: document.id, database: document.database });
                if (existingId) {
                    existingIds.push(document.id)
                } else {
                    if (document.comPanNo) {
                        const codes = document.comPanNo;
                        document[code] = codes;
                        const existingRecord = await Customer.findOne({
                            comPanNo: document.comPanNo, database: document.database
                        });
                        if (!existingRecord) {
                            const insertedDocument = await Customer.create(document);
                            insertedDocuments.push(insertedDocument);
                        } else {
                            existingParts.push(document.comPanNo);
                        }
                    } else {
                        if (document.aadharNo) {
                            const codes = document.aadharNo;
                            document[code] = codes;
                            const existingRecord = await Customer.findOne({
                                aadharNo: document.aadharNo, database: document.database
                            });
                            if (!existingRecord) {
                                const insertedDocument = await Customer.create(document);
                                insertedDocuments.push(insertedDocument);
                            } else {
                                existingParts.push(document.aadharNo);
                            }
                        } else {
                            panMobile.push(document.aadharNo);
                        }
                    }
                }
            } else {
                dataNotExist.push(document.ownerName)
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some party already exist: ${existingParts.join(', ')}`;
        } else if (panMobile.length > 0) {
            message = `this pan or aadhar already exist: ${panMobile.join(', ')}`;
        } else if (existingIds.length > 0) {
            message = `this customer id's already exist: ${existingIds.join(', ')}`;
        } else if (dataNotExist.length > 0) {
            message = `this customer database not exist: ${dataNotExist.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const saveExcelFile = async (req, res) => {
    try {
        let id = "id";
        let comPanNo = "comPanNo";
        let category = "category";
        let database = "database";
        let rolename = "rolename";
        let remainingLimit = "remainingLimit";
        let City = "City";
        let State = "State";
        const filePath = await req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const headerRow = worksheet.getRow(1);
        const headings = [];
        headerRow.eachCell((cell) => {
            headings.push(cell.value);
        });
        const existingParts = [];
        const panMobile = [];
        const existingIds = []
        const dataNotExist = []
        const group = [];
        const roles = []
        const IdNotExisting = []
        const GSTPercentage = []
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                if (heading === 'email' && typeof cellValue === 'object' && 'text' in cellValue) {
                    document[heading] = cellValue.text;
                } else {
                    document[heading] = cellValue;
                }
                // document[heading] = cellValue;
            }
            document[database] = req.params.database
            if (document.database) {
                if (document.limit) {
                    document[remainingLimit] = document.limit
                }
                const role = await Role.findOne({ id: document.rolename, database: document.database })
                if (!role) {
                    roles.push(document.ownerName)
                } else {
                    document[rolename] = role._id.toString()
                    const existCustomerGroup = await CustomerGroup.findOne({ id: document.category, database: document.database, status: "Active" })
                    if (!existCustomerGroup) {
                        group.push(document.id)
                    } else {
                        document[category] = await existCustomerGroup._id.toString()
                        const existingId = await Customer.findOne({ id: document.id, database: document.database, status: "Activee" });
                        if (existingId) {
                            existingIds.push(document.id)
                        } else {
                            if (document.pincode) {
                                const data = await GetCityByPincode(document.pincode)
                                document[State] = data.StateName;
                                document[City] = data.District;
                            }
                            if (document.gstNumber) {
                                if (document.gstNumber.length !== 15) {
                                    GSTPercentage.push(document.gstNumber)
                                    continue
                                }
                                document[comPanNo] = document.gstNumber.slice(2, -3);
                                document[id] = document.comPanNo
                                const existingRecord = await Customer.findOne({
                                    comPanNo: document.comPanNo, database: document.database, status: "Active"
                                });
                                const existingGst = await Customer.findOne({
                                    gstNumber: document.gstNumber, database: document.database, status: "Active"
                                });
                                if (!existingRecord && !existingGst) {
                                    const insertedDocument = await Customer.create(document);
                                } else {
                                    existingParts.push(document.gstNumber);
                                }
                            } else {
                                if (document.aadharNo) {
                                    document[id] = document.aadharNo
                                    const existingRecord = await Customer.findOne({
                                        aadharNo: document.aadharNo, database: document.database, status: "Active"
                                    });
                                    if (!existingRecord) {
                                        const insertedDocument = await Customer.create(document);
                                    } else {
                                        existingParts.push(document.aadharNo);
                                    }
                                } else {
                                    panMobile.push(document.aadharNo);
                                }
                            }
                        }
                    }
                }
            } else {
                dataNotExist.push(document.ownerName)
            }
        }
        let message = 'Data Inserted Successfully';
        if (GSTPercentage.length > 0) {
            message = `this customer gstNo Invalid : ${GSTPercentage.join(', ')}`;
        } else if (existingParts.length > 0) {
            message = `Some party GST, PanNo or Aadhar already exist: ${existingParts.join(', ')}`;
        } else if (panMobile.length > 0) {
            message = `this pan or aadhar already exist: ${panMobile.join(', ')}`;
        } else if (existingIds.length > 0) {
            message = `this customer id's already exist: ${existingIds.join(', ')}`;
        } else if (dataNotExist.length > 0) {
            message = `this customer database not exist: ${dataNotExist.join(', ')}`;
        } else if (group.length > 0) {
            message = `this customer category id not exist: ${group.join(', ')}`;
        } else if (roles.length > 0) {
            message = `this customer role id not exist: ${roles.join(', ')}`;
        } else if (IdNotExisting.length > 0) {
            message = `this customer id is required : ${IdNotExisting.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const GetCityByPincode = async (pincode) => {
    try {
        const res = await axios.get("https://vikram-pratap-singh10.github.io/pincodeAPI/output.json")
        if (res.data) {
            for (let item of res.data) {
                if (pincode == item.Pincode) {
                    return item
                }
            }
        }
        return null
    }
    catch (err) {
        console.log(err)
    }
}
export const updateExcelFile = async (req, res) => {
    try {
        let database = "database";
        let category = "category";
        let rolename = "rolename";
        let remainingLimit = "remainingLimit";
        const filePath = await req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const headerRow = worksheet.getRow(1);
        const headings = [];
        headerRow.eachCell((cell) => {
            headings.push(cell.value);
        });
        const insertedDocuments = [];
        const existingParts = [];
        const dataNotExist = []
        const group = [];
        const roles = [];
        const IdNotExisting = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                if (heading === 'email' && typeof cellValue === 'object' && 'text' in cellValue) {
                    document[heading] = cellValue.text;
                } else {
                    document[heading] = cellValue;
                }
            }
            document[database] = req.params.database
            const role = await Role.findOne({ id: document.rolename, database: document.database })
            if (!role) {
                roles.push(document.ownerName)
            } else {
                const existCustomerGroup = await CustomerGroup.findOne({ id: document.category, database: document.database, status: "Active" })
                if (!existCustomerGroup) {
                    group.push(document.id)
                } else {
                    const existCustomer = await Customer.findOne({ id: document.id, database: document.database, status: "Active" })
                    if (!existCustomer) {
                        IdNotExisting.push(document.id)
                    } else {
                        if (document.paymentTerm === existCustomer.paymentTerm && document.paymentTerm !== "cash") {
                            if (existCustomer.limit !== document.limit) {
                                const diff = document.limit - existCustomer.limit
                                document[remainingLimit] = (existCustomer.remainingLimit || 0 + diff);
                            }
                        } else {
                            if (document.paymentTerm !== "cash") {
                                if (document.limit) {
                                    document[remainingLimit] = document.limit;
                                }
                            }
                        }
                        document[rolename] = role._id.toString()
                        document[category] = await existCustomerGroup._id.toString()
                        const filter = { id: document.id, database: req.params.database };
                        const options = { new: true, upsert: true };
                        const insertedDocument = await Customer.findOneAndUpdate(filter, document, options);
                        insertedDocuments.push(insertedDocument);
                    }
                }
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some party already exist: ${existingParts.join(', ')}`;
        } else if (roles.length > 0) {
            message = `this customer role id not exist : ${roles.join(', ')}`;
        } else if (group.length > 0) {
            message = `this customer category id not exist : ${group.join(', ')}`;
        } else if (dataNotExist.length > 0) {
            message = `this customer database not exist : ${dataNotExist.join(', ')}`;
        } else if (IdNotExisting.length > 0) {
            message = `this customer id not found : ${IdNotExisting.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}

export const dueParty = async (req, res) => {
    try {
        const dues = await OverDueReport.find({ database: req.params.database, activeStatus: "Active" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" })
        if (!dues.length > 0) {
            return res.status(404).json({ message: "due not found", status: false })
        }
        for (let id of dues) {
            const lastOrderDate = id?.createdAt
            const currentDate = new Date();
            const timeDifference = currentDate - lastOrderDate;
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
            if (days >= 30) {
                id.dueStatus = "overDue",
                    id.overDueDate = new Date(new Date())
                await id.save()
            }
        }
        const due = await OverDueReport.find({ database: req.params.database, dueStatus: "due", activeStatus: "Active" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" })
        if (!due.length > 0) {
            return res.status(404).json({ message: "due not found", status: false })
        }
        return res.status(200).json({ due, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const overDueReport = async (req, res) => {
    try {
        const due = await OverDueReport.find({ database: req.params.database, dueStatus: "overDue", activeStatus: "Active" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" })
        if (!due.length > 0) {
            return res.status(404).json({ message: "due not found", status: false })
        }
        return res.status(200).json({ due, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const lockParty = async (req, res, next) => {
    try {
        const customer = await Customer.find({ autoBillingStatus: "locked" })
        if (!customer.length > 0) {
            return res.status(404).json({ message: "party not found", status: false })
        }
        return res.status(200).json({ customer, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const paymentDueReport = async (req, res) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let paymentDueReport = [];
        let dayss = 0;
        let days = 0;
        const dues = await PaymentDueReport.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" });
        if (!dues.length > 0) {
            return res.status(404).json({ message: "payment due report not found", status: false });
        }
        for (let id of dues) {
            const user = await User.findById({ _id: id.partyId.created_by })
            if (!user) {
                continue;
            }
            const lastOrderDate = id?.createdAt;
            const currentDate = new Date();
            const timeDifference = currentDate - lastOrderDate;
            days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            if (days >= 30) {
                id.dueStatus = "overDue";
                id.overDueDate = new Date(new Date);
                await id.save();
            }
            if (id.overDueDate) {
                const lastOverDueDate = id?.overDueDate;
                const currentDate = new Date();
                const timeDifference = currentDate - lastOverDueDate;
                dayss = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            }
            id.dueDays = days;
            id.overDueDays = dayss;
            id.salesPerson = `${user.firstName}  ${user.lastName}`
            paymentDueReport.push(id);
        }
        if (!paymentDueReport.length > 0) {
            return res.status(404).json({ message: "payment due report not found", status: false });
        }
        return res.status(200).json({ PaymentDueReport: paymentDueReport, status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}

// ------------------------------------------------------------
export const SaveLeadPartyExcel = async (req, res) => {
    try {
        let leadStatusCheck = "leadStatusCheck";
        let database = "database"
        const existingMobileNo = []
        const filePath = await req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const headerRow = worksheet.getRow(1);
        const headings = [];
        headerRow.eachCell((cell) => {
            headings.push(cell.value);
        });
        const insertedDocuments = [];
        const dataNotExist = []
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                if (heading === 'email' && typeof cellValue === 'object' && 'text' in cellValue) {
                    document[heading] = cellValue.text;
                } else {
                    document[heading] = cellValue;
                }
                // document[heading] = cellValue;
            }
            document[database] = req.params.database
            if (document.database) {
                const existingId = await Customer.findOne({ mobileNumber: document.mobileNumber, database: document.database });
                if (existingId) {
                    existingMobileNo.push(document.mobileNumber)
                } else {
                    document[leadStatusCheck] = "true";
                    const insertedDocument = await Customer.create(document);
                    insertedDocuments.push(insertedDocument);
                }
            } else {
                dataNotExist.push(document.ownerName)
            }
        }
        let message = 'Data Inserted Successfully';
        if (dataNotExist.length > 0) {
            message = `this customer database not exist: ${dataNotExist.join(', ')}`;
        } else if (existingMobileNo.length > 0) {
            message = `this mobile no already exists: ${existingMobileNo.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const LeadPartyList = async (req, res, next) => {
    try {
        const party = await Customer.find({ database: req.params.database, leadStatusCheck: "true" }).populate({ path: "created_by", model: "user" });
        if (party.length == 0) {
            return res.status(404).json({ message: "Data Not Found", status: false })
        }
        return res.status(200).json({ LeadParty: party, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const AssignLeadParty = async (req, res, next) => {
    try {
        const sales = await User.findById({ _id: req.body.salesPerson })
        if (!sales) {
            return res.status(404).json({ message: "user not found", status: false })
        }
        for (let id of req.body.leadParty) {
            const party = await Customer.findById(id.id)
            if (!party) {
                continue
            }
            party.created_by = req.body.salesPerson
            await party.save()
        }
        return res.status(200).json({ message: "assign successfull!", status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteAssignLeadParty = async (req, res, next) => {
    try {
        for (let id of req.body.leadParty) {
            const person = await Customer.findById({ _id: id.id });
            if (person) {
                person.created_by = undefined;
                await person.save();
            }
        }
        return res.status(200).json({ message: "Unassign successfull!", status: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const PartyWithSalesPerson = async (req, res, next) => {
    try {
        const party = await Customer.find({ created_by: req.params.id, leadStatusCheck: "true" }).populate({ path: "created_by", model: "user" });
        if (!party) {
            return res.status(404).json({ message: "party not found", status: false })
        }
        return res.status(200).json({ LeadParty: party, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const DeleteSalesLead = async (req, res, next) => {
    try {
        const customer = await Customer.findByIdAndDelete({ _id: req.params.id })
        if (!customer) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        // customer.status = "Deactive";
        // await customer.save();
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const DeleteSalesLeadMultiple = async (req, res, next) => {
    try {
        for (let id of req.body.salesLead) {
            const customer = await Customer.findByIdAndDelete({ _id: id.id })
            if (!customer) {
                console.log("customer not found")
                // return res.status(404).json({ error: "Not Found", status: false });
            }
            // customer.status = "Deactive";
            // await customer.save();
        }
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const SaveRemark = async (req, res, next) => {
    try {
        const party = await Customer.findById(req.params.id)
        if (!party) {
            return res.status(404).json({ message: "Party Not Found", status: false })
        }
        await party.remark.push(req.body.remark)
        await party.save()
        return res.status(200).json({ message: "Remark Saved Successfull!", status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const LeadPartyListById = async (req, res, next) => {
    try {
        const party = await Customer.findById(req.params.id).populate({ path: "created_by", model: "user" });
        if (!party) {
            return res.status(404).json({ message: "Data Not Found", status: false })
        }
        return res.status(200).json({ LeadParty: party, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UpdateSalesLead = async (req, res, next) => {
    try {
        if (req.files) {
            let images = [];
            req.files.map(file => {
                if (file.fieldname === "file") {
                    req.body.Photo = file.filename
                }
                else {
                    images.push(file.filename)
                }
            })
            req.body.shopPhoto = images;
            // req.body.photo = images
        }
        const customerId = req.params.id;
        const existingCustomer = await Customer.findById(customerId);
        if (!existingCustomer) {
            return res.status(404).json({ error: 'customer not found', status: false });
        }
        else {
            if (req.body.assignTransporter) {
                req.body.assignTransporter = JSON.parse(req.body.assignTransporter)
            }
            const updatedCustomer = req.body;
            const existOver = await OverDueReport.findOne({ partyId: customerId, activeStatus: "Active" })
            if (existOver) {
                existOver.lockingAmount = req.body.limit
                await existOver.save()
            }
            await Customer.findByIdAndUpdate(customerId, updatedCustomer, { new: true });
            return res.status(200).json({ message: 'Customer Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}

export const DeleteCustomer11 = async (req, res, next) => {
    try {
        const customer = await User.find({ database: "five" })
        if (customer.length == 0) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        console.log(customer.length)
        for (let id of customer) {

            console.log(id._id)
            await User.findByIdAndDelete(id._id)

        }
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}

// same stock-updation
export const ViewDeadParty = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const currentDate = moment();
        const startOfLastMonth = currentDate.clone().subtract(30, 'days');
        const hierarchy = await Customer.find({ database: database, status: 'Active', createdAt: { $lt: startOfLastMonth } }).populate({ path: "created_by", model: "user" }).lean();

        // const allOrderedParties = await CreateOrder.find({ database: database, createdAt: { $gte: startOfLastMonth.toDate() } }).lean();

        const receiptMap = {};
        await Promise.all(hierarchy.map(async (item) => {
            const payment = await Receipt.findOne({ type: "receipt", partyId: item._id }).sort({ createdAt: -1 }).lean();
            receiptMap[item._id] = payment ? payment.createdAt : "0";
        }));

        const result = await Promise.all(hierarchy.map(async (item) => {
            // const party = await partyHierarchy(item.created_by, database);
            // return { id: item, party: party, lastDays: receiptMap[item._id] };
            return { id: item, lastDays: receiptMap[item._id] };
        }));

        return res.status(200).json({ Parties: result, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const Check = async (req, res, next) => {
    try {
        const party = await Customer.findById(req.body.partyId)
        if (party.paymentTerm === "credit") {
            await checkLimit(req.body)
        } else {
            return res.send("OK")
        }
    }
    catch (err) {
        console.log(err)
    }
}