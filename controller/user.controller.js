import dotenv from "dotenv"
import ExcelJS from "exceljs";
import axios from "axios";
import { User } from "../model/user.model.js";
import Jwt from "jsonwebtoken";
import { getUserHierarchyDetails } from "../rolePermission/RolePermission.js";
import { getUserWarehouseHierarchy } from "../rolePermission/permission.js";
import { Customer } from "../model/customer.model.js";
import transporterss from "../service/email.js";
import { Warehouse } from "../model/warehouse.model.js";
import { ruleCreation } from "../model/ruleCreation.model.js";
import { ApplyRule } from "../model/rule.applied.model.js";
import { UserDetail } from "../model/userDetails.model.js";
import { Subscription } from "../model/subscription.model.js";
import { Role } from "../model/role.model.js";
import mongoose from "mongoose";
import { WorkingHours } from "../model/workingHours.model.js";
import { UserBranch } from "../model/userBranch.model.js";
import { LoginVerificationMail } from "../service/sendmail.js";
dotenv.config();


export const SaveUser = async (req, res, next) => {
  try {
    if (req.body.id) {
      const existing = await User.findOne({ status: "Active", database: req.body.database, id: req.body.id })
      if (existing) {
        return res.status(404).json({ message: "id already exist", status: false })
      }
    } else {
      return res.status(400).json({ message: "user id required", status: false })
    }
    if (req.file) {
      req.body.profileImage = req.file.filename;
    }
    if (req.body.Pan_No) {
      req.body.code = req.body.Pan_No
    } else {
      if (req.body.Aadhar_No) {
        req.body.code = req.body.Aadhar_No
      } else {
        return res.status(400).json({ message: "It is necessary to insert aadhar no. or pan no.", status: false })
      }
    }
    if (req.body.setRule) {
      req.body.setRule = await JSON.parse(req.body.setRule)
    }
    if (req.body.subscriptionPlan) {
      const sub = await Subscription.findById(req.body.subscriptionPlan)
      if (sub) {
        // const { _id, ...subWithoutId } = sub.toObject();
        const date = new Date();
        req.body.planStart = date;
        req.body.planEnd = new Date(date.getTime() + (sub.days * 24 * 60 * 60 * 1000));
        req.body.billAmount = sub.subscriptionCost
        req.body.userAllotted = sub.noOfUser
      }
    }
    if (req.body.warehouse) {
      req.body.warehouse = await JSON.parse(req.body.warehouse)
      await assingWarehouse(req.body.warehouse, user._id)
    }
    const user = await User.create(req.body);
    if (req.body.warehouse) {
      await assingWarehouse(user.warehouse, user._id)
    }
    if (user) {
      await setSalary(user)
    }
    return user ? res.status(200).json({ message: "Data Save Successfull", User: user, status: true }) : res.status(400).json({ message: "Something Went Wrong", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const ViewRegisterUser = async (req, res, next) => {
  try {
    let user = await User.find({ database: req.params.database, status: "Active" }).populate({ path: "branch", model: "userBranch" }).populate({ path: "rolename", model: "role" })
    if (user.length === 0) {
      return res.status(404).json({ message: "user not found", status: false })
    }
    return res.status(200).json({ User: user, status: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const SuperAdminRoleUpdate = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "user not found", status: false })
    }
    user.rolename = req.body.rolename || user.rolename
    await user.save()
    return res.status(200).json({ message: "updated successfull !", status: true })
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", status: false })
  }
}
export const ViewUserById = async (req, res, next) => {
  try {
    let user = await User.findById({ _id: req.params.id, status: "Active" }).populate({ path: "subscriptionPlan", model: "subscription" }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" }).populate({ path: "branch", model: "userBranch" }).populate({ path: "shift", model: "WorkingHour" }).populate({ path: "warehouse.id", model: "warehouse" })
    return res.status(200).json({ User: user, status: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
// -------------------------------------------------------
export const ViewUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const database = req.params.database;
    const adminDetail = await getUserHierarchyDetails(userId, database);
    // if (!adminDetail.length > 0) {
    //   return res.status(400).json({ message: "not found", status: false })
    // }
    // const adminDetail = await getUserHierarchyBottomToTop(userId)
    // const ud = await User.find({ database: database })
    return adminDetail.length > 0 ? res.status(200).json({ adminDetails: adminDetail, status: true }) : res.status(404).json({ error: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const DeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: "Not Found", status: false });
    }
    user.status = "Deactive";
    await user.save();
    return res.status(200).json({ message: "delete successful", status: true })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error", status: false });
  }
};
export const UpdateUser = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.profileImage = req.file.filename;
    }
    const userId = req.params.id;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "user not found", status: false });
    } else {
      if (req.body.setRule) {
        req.body.setRule = JSON.parse(req.body.setRule)
      }
      if (req.body.subscriptionPlan) {
        const sub = await Subscription.findById({ _id: req.body.subscriptionPlan })
        if (sub) {
          // const { _id, ...subWithoutId } = sub.toObject();
          const date = new Date();
          req.body.planStart = date;
          req.body.planEnd = new Date(date.getTime() + (sub.days * 24 * 60 * 60 * 1000));
          req.body.billAmount = sub.subscriptionCost
          req.body.userAllotted = sub.noOfUser
        }
      }
      if (req.body.warehouse?.length > 0) {
        req.body.warehouse = JSON.parse(req.body.warehouse)
      }
      const updatedUser = req.body;
      const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
      if (req.body.warehouse?.length > 0) {
        await assingWarehouse(user.warehouse, userId)
      }
      if (user) {
        await setSalary(user)
      }
      return res.status(200).json({ message: "User Updated Successfully", status: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
// -----------------------------------------------
const otpStore = {};

export const SignIn = async (req, res, next) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const { email, password, latitude, longitude, currentAddress } = req.body;
    let existingAccount = await User.findOne({ email }).populate({ path: "rolename", model: "role" }).populate({ path: "branch", model: "userBranch" });
    let existingCustomer = await Customer.findOne({ email }).populate({ path: "rolename", model: "role" })
    if (!existingAccount && !existingCustomer) {
      return res.status(400).json({ message: "Incorrect email", status: false });
    }
    if (existingAccount) {
      if (existingAccount.rolename.roleName === "MASTER") {
        existingAccount.otp = otp
        await LoginVerificationMail(existingAccount, otp)
        await existingAccount.save()
        return res.status(200).json({ message: "otp send successfull!", user: { ...existingAccount.toObject(), password: undefined, otp: undefined, role: "MASTER" }, status: true })
      }
    }
    if (existingAccount && existingAccount.password !== password ||
      existingCustomer && existingCustomer.password !== password) {
      return res.status(400).json({ message: "Incorrect password", status: false });
    }
    const token = Jwt.sign({ subject: email }, process.env.TOKEN_SECRET_KEY);
    if (existingAccount) {
      await User.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
      return res.json({ message: "Login successful", user: { ...existingAccount.toObject(), password: undefined, token }, status: true, });
    }
    if (existingCustomer) {
      await Customer.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
      return res.json({ message: "Login successful", user: { ...existingCustomer.toObject(), password: undefined, token }, status: true, });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: email }).populate({ path: "rolename", model: "role" }).populate({ path: "branch", model: "userBranch" });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (user.otp === otp) {
      const token = Jwt.sign({ subject: email }, process.env.TOKEN_SECRET_KEY);
      return res.json({ message: "Login Successfull", user: { ...user.toObject(), password: undefined, token }, status: true, });
    } else {
      return res.status(400).json({ error: "Invalid otp", status: false });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const EditProfile = async (req, res, next) => {
  try {
    // req.body.password = await bcryptjs.hash(req.body.password,await bcryptjs.genSalt(10))
    const userId = req.params.id;
    if (req.file) {
      req.body.profileImage = req.file.filename;
    }
    // req.body.profileImage = req.file.filename || null
    const userDetail = req.body;
    const user_first = await User.findById(req.params.id);
    if (!user_first) {
      return res.status(404).json({ error: "this user not found", status: false });
    }
    const user = await User.findByIdAndUpdate(userId, userDetail, { new: true, });
    if (user)
      return res.status(200).json({ User: user, message: "successful updated", status: true });
    return res.status(404).json({ error: "something went wrong", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
// --------------------------------------------------------
const resetOTP = {};
export const forgetPassword = async (request, response, next) => {
  try {
    const { email } = request.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    resetOTP[email] = otp;
    const user = await User.findOne({ email });
    const user1 = await Customer.findOne({ email });
    if (!user && !user1) {
      return response.status(404).json({ message: "User not found" });
    }
    var mailOptions = {
      from: {
        name: "Distribution Management System",
        address: "vikramsveltose022@gmail.com",
      },
      to: email,
      subject: "Password has been reset",
      html: '<div style={{fontFamily: "Helvetica,Arial,sans-serif",minWidth: 1000,overflow: "auto",lineHeight: 2}}<div style={{ margin: "50px auto", width: "70%", padding: "20px 0" }}><div style={{ borderBottom: "1px solid #eee" }}><a href=""style={{ fontSize: "1.4em",color: "#00466a" textDecoration: "none",fontWeight: 600}}></a></div><p style={{ fontSize: "1.1em" }}>Hi,</p><p>The password for your Distribution Management System Password has been successfully reset</p><h2 value="otp" style={{ background: "#00466a", margin: "0 auto",width: "max-content" padding: "0 10px",color: "#fff",borderRadius: 4}}>' +
        otp +
        '</h2><p style={{ fontSize: "0.9em" }}Regards,<br />Distribution Management System</p><hr style={{ border: "none", borderTop: "1px solid #eee" }} /></div</div>',
    };
    await transporterss.sendMail(mailOptions, (error, info) => {
      !error ? response.status(201).json({ user: user, message: "send otp on email", status: true }) : console.log(error) || response.json({ error: "something went wrong" });
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
    const newPassword = request.body.password;
    const confirmPassword = request.body.confirmPassword;
    if (newPassword !== confirmPassword) {
      return response.status(400).json({ error: "Passwords don't match", status: false });
    } else {
      // Use bcrypt to hash the new password
      // const hashedPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(15));
      const userUpdate = await User.updateOne({ _id: userId }, { password: request.body.password });
      const customerUpdate = await Customer.updateOne({ _id: userId }, { password: request.body.password });
      if ((userUpdate && userUpdate.modifiedCount > 0) || (customerUpdate && customerUpdate.modifiedCount > 0)) {
        return response.status(200).json({ Message: "Password updated successfully", status: true });
      }
      return response.status(400).json({ Message: "Unauthorized User...", status: false });
    }
  } catch (err) {
    console.error(err);
    return response.status(500).json({ Message: "Internal Server Error...", status: false });
  }
};

export const ViewWarehouse = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const adminDetail = await getUserWarehouseHierarchy(userId);
    // let user = await User.findById({ _id: req.params.id }).sort({ sortorder: -1 }).populate({ path: "rolename", model: "role" }).populate({ path: "created_by", model: "user" })
    return adminDetail.length > 0 ? res.status(200).json({ adminDetails: adminDetail, status: true }) : res.status(404).json({ error: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const saveUserWithExcel = async (req, res) => {
  try {
    let code = "code";
    let database = "database";
    let rolename = "rolename";
    let shift = "shift";
    let branch = "branch"
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
    const existingIds = [];
    const dataNotExist = [];
    const roles = [];
    const shiftss = [];
    const branchss = [];
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
        // document[heading] = cellValue;
      }
      document[database] = req.params.database
      if (document.database) {
        const role = await Role.findOne({ id: document.rolename, database: document.database })
        if (!role) {
          roles.push(document.id)
        } else {
          const shifts = await WorkingHours.findOne({ status: "Active", id: document.shift, database: document.database })
          if (!shifts) {
            shiftss.push(document.id)
          } else {
            const branchs = await UserBranch.findOne({ id: document.branch, database: document.database })
            if (!branchs) {
              branchss.push(document.id)
            } else {
              document[rolename] = role._id.toString()
              document[shift] = shifts._id.toString()
              document[branch] = branchs._id.toString()
              if (document.id) {
                const existingId = await User.findOne({ id: document.id, database: document.database, status: "Active" });
                if (existingId) {
                  existingIds.push(document.id)
                } else {
                  if (document.Pan_No) {
                    // document[code] = document.Pan_No;
                    const existingRecord = await User.findOne({
                      Pan_No: document.Pan_No, database: document.database, status: "Active"
                    });
                    if (!existingRecord) {
                      const insertedDocument = await User.create(document);
                      insertedDocuments.push(insertedDocument);
                    } else {
                      existingParts.push(document.Pan_No);
                    }
                  } else {
                    if (document.Aadhar_No) {
                      // const codes = document.Aadhar_No;
                      // document[code] = codes;
                      const existingRecord = await User.findOne({
                        Aadhar_No: document.Aadhar_No, database: document.database, status: "Active"
                      });
                      if (!existingRecord) {
                        const insertedDocument = await User.create(document);
                        insertedDocuments.push(insertedDocument);
                      } else {
                        existingParts.push(document.Aadhar_No);
                      }
                    } else {
                      // const insertedDocument = await Customer.create(document);
                      panMobile.push(document.Aadhar_No);
                    }
                  }
                }
              } else {
                IdNotExisting.push(document.firstName)
              }
            }
          }
        }
      } else {
        dataNotExist.push(document.firstName)
      }
    }
    let message = 'Data Inserted Successfully';
    if (existingParts.length > 0) {
      message = `some user already exist: ${existingParts.join(', ')}`;
    } else if (panMobile.length > 0) {
      message = `Pan Or Aadhar Not Exist : ${panMobile.join(', ')}`;
    } else if (existingIds.length > 0) {
      message = `this user id already exist: ${existingIds.join(', ')}`;
    } else if (dataNotExist.length > 0) {
      message = `this user's database not exist: ${dataNotExist.join(', ')}`;
    } else if (roles.length > 0) {
      message = `this user's rolename not correct: ${roles.join(', ')}`;
    } else if (IdNotExisting.length > 0) {
      message = `this user's id is required : ${IdNotExisting.join(', ')}`;
    } else if (shiftss.length > 0) {
      message = `this user's shift id is required : ${shiftss.join(', ')}`;
    } else if (branchss.length > 0) {
      message = `this user's branch id is required : ${branchss.join(', ')}`;
    }
    return res.status(200).json({ message, status: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', status: false });
  }
}
export const updateUserWithExcel = async (req, res) => {
  try {
    let rolename = "rolename";
    let shift = "shift";
    let branch = "branch"
    let database = "database";
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
    const roles = [];
    const shiftss = [];
    const branchss = [];
    const dataNotExist = [];
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
        // document[heading] = cellValue;
      }
      document[database] = req.params.database
      // if (document.database) {
      const role = await Role.findOne({ id: document.rolename, database: document.database })
      if (!role) {
        roles.push(document.id)
      } else {
        const shifts = await WorkingHours.findOne({ id: document.shift, database: document.database, status: "Active" })
        if (!shifts) {
          shiftss.push(document.id)
        } else {
          const branchs = await UserBranch.findOne({ id: document.branch, database: document.database })
          if (!branchs) {
            branchss.push(document.id)
          } else {
            const existUser = await User.findOne({ id: document.id, database: document.database, status: "Active" })
            if (!existUser) {
              IdNotExisting.push(document.id)
            } else {
              document[rolename] = role._id.toString()
              document[shift] = shifts._id.toString()
              document[branch] = branchs._id.toString()
              const filter = { id: document.id, database: req.params.database };
              const options = { new: true, upsert: true };
              const insertedDocument = await User.findOneAndUpdate(filter, document, options);
              insertedDocuments.push(insertedDocument);
            }
          }
        }
      }
      // } else {
      //   dataNotExist.push(document.id)
      // }
      // const filter = { id: document.id, database: req.params.database };
      // const options = { new: true, upsert: true };
      // const insertedDocument = await User.findOneAndUpdate(filter, document, options);
      // insertedDocuments.push(insertedDocument);
    }
    let message = 'User Updated Successfully!';
    if (existingParts.length > 0) {
      message = `some user already exist: ${existingParts.join(', ')}`;
    } else if (roles.length > 0) {
      message = `this user's role id not correct : ${roles.join(', ')}`;
    } else if (shiftss.length > 0) {
      message = `this user's shift id is required : ${shiftss.join(', ')}`;
    } else if (branchss.length > 0) {
      message = `this user's branch id is required : ${branchss.join(', ')}`;
    } else if (dataNotExist.length > 0) {
      message = `this user's database not exist : ${dataNotExist.join(', ')}`;
    } else if (IdNotExisting.length > 0) {
      message = `this user's id not found : ${IdNotExisting.join(', ')}`;
    }
    return res.status(200).json({ message, status: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', status: false });
  }
}

export const UserList = async (req, res, next) => {
  try {
    const database = req.params.database
    const user = await User.find({ database: database }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" })
    let customer = await Customer.find({ database: database }).sort({ sortorder: -1 }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" })
    const data = user.concat(customer)
    return data.length > 0 ? res.status(200).json({ User: data, status: true }) : res.status(404).json({ message: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const assignUser = async (req, res, next) => {
  try {
    const { childs } = req.body;
    const manager = await User.findById({ _id: req.body.parentId })
    if (!manager) {
      return res.status(404).json({ message: "User Not Found", status: false })
    }
    for (let id of childs) {
      const person = await User.findById({ _id: id.id });
      if (person) {
        person.created_by = manager._id;
        person.database = manager.database;
        await person.save();
      }
      const customer = await Customer.findById({ _id: id.id })
      if (customer) {
        customer.created_by = manager._id;
        customer.database = manager.database;
        await customer.save();
      }
    }
    return res.status(200).json({ message: "Users assigned successfully", status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const verifyPanNo = async (req, res) => {
  try {
    const { panNo, database } = req.body;
    if (!panNo) {
      return res.status(400).json({ status: false, message: 'PAN card number is required.' });
    }
    // const existingFace = await User.findOne({ Pan_No: panNo});
    const existingFace = await User.findOne({ $or: [{ Pan_No: panNo, database: database }, { Aadhar_No: panNo, database: database }] });
    if (existingFace) {
      return res.status(200).json({ status: true, message: 'PAN card verification successful.', User: existingFace });
    } else {
      return res.status(404).json({ status: false, message: 'PAN card not found. Verification unsuccessful.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
}
export const deleteAssignUser = async (req, res, next) => {
  try {
    const { childs } = req.body;
    for (let id of childs) {
      const person = await User.findById({ _id: id.id });
      if (person) {
        person.created_by = undefined;
        // person.database = undefined;
        await person.save();
      }
      const customer = await Customer.findById({ _id: id.id })
      if (customer) {
        customer.created_by = undefined;
        // customer.database = undefined;
        await customer.save();
      }
    }
    return res.status(200).json({ message: "Users assigned successfully", status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const assingWarehouse = async function assingWarehouse(warehouse, userId) {
  try {
    for (let id of warehouse) {
      const warehouse = await Warehouse.findById(id.id)
      if (warehouse) {
        warehouse.created_by = userId;
        warehouse.assignStatus = true;
        await warehouse.save();
      }
    }
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}
export const GetExcelKeys = async (req, res) => {
  const excludedKeys = ['_id', 'createdAt', 'updatedAt', '__v', 'latitude', 'longitude', 'currentAddress', 'warehouse', 'typeStatus', 'otpVerify', 'position', 'code', 'created_by', 'status'];
  const modelKeys = Object.keys(User.schema.paths).filter(key => !excludedKeys.includes(key));
  return res.status(200).json({ keys: modelKeys, status: true });
}


export const setSalary = async (body) => {
  try {
    const salary = [];
    let employee = [];
    for (let data of body.setRule) {
      const check = await ruleCreation.findOne({ title: data.title });
      if (check) {
        let amount = (check.type === "percentage") ? body.last_job_Salary * check.typeValue / 100 : check.typeValue;
        let rule = {
          employeeName: body.firstName + " " + body.lastName,
          panNo: body.Pan_No,
          salary: body.last_job_Salary,
          option: check.title,
          type: check.type,
          amount: amount,
          title: check.title,
          rule: check.rule,
          period: check.period,
          typeValue: check.typeValue
        };
        employee.push(rule)
        salary.push(rule);
      }
    }
    let rules = {
      userId: body._id,
      database: body.database,
      employeeName: body.firstName + " " + body.lastName,
      salary: body.last_job_Salary,
      employee: employee
    };
    const user = await ApplyRule.findOne({ userId: rules.userId })
    if (user) {
      await ApplyRule.findOneAndUpdate({ userId: rules.userId }, rules, { new: true })
    } else {
      await ApplyRule.create(rules)
    }
    return salary;
  } catch (err) {
    console.log(err);
  }
};
export const viewApplyRules = async (req, res, next) => {
  try {
    const rule = await ApplyRule.find({ status: "Active", database: req.params.database })
    return (rule.length > 0) ? res.status(200).json({ ApplyRule: rule, status: true }) : res.status(404).json({ error: "Not Found", status: false });
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}
export const viewApplyRulesById = async (req, res, next) => {
  try {
    const rule = await ApplyRule.find({ status: "Active", userId: req.params.id })
    return (rule.length > 0) ? res.status(200).json({ ApplyRule: rule, status: true }) : res.status(404).json({ error: "Not Found", status: false });
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}

export const SaveUserDetail = async (req, res, next) => {
  try {
    if (req.files) {
      req.files.map(file => {
        if (file.fieldname === "photo") {
          req.body.photo = file.filename
        }
        else {
          req.body.signature = file.filename
        }
      })
    }
    const userId = req.body.userId
    const users = await UserDetail.findOne({ userId: userId, status: "Active" })
    if (users) {
      const updatedData = req.body;
      const user = await UserDetail.findByIdAndUpdate(users._id, updatedData, { new: true });
      return res.status(200).json({ message: "update data successfull!", stutas: true, UserDetail: user })
    }
    const user = await UserDetail.create(req.body)
    return user ? res.status(200).json({ message: "Date Saved Successfull!", stutas: true }) : res.status(400).json({ message: "Bad Request", status: false })
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}
export const ViewUserDetail = async (req, res, next) => {
  try {
    const user = await UserDetail.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 })
    return (user.length > 0) ? res.status(200).json({ UserDetail: user, stutas: true }) : res.status(404).json({ message: "Not Found", status: false })
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}
export const ViewByIdUserDetail = async (req, res, next) => {
  try {
    const user = await UserDetail.findOne({ userId: req.params.id, status: "Active" }).sort({ sortorder: -1 })
    return (user) ? res.status(200).json({ UserDetail: user, stutas: true }) : res.status(404).json({ message: "Not Found", status: false })
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}
export const DeleteUserDetail = async (req, res, next) => {
  try {
    const user = await UserDetail.findById(req.params.id).sort({ sortorder: -1 })
    if (!user) {
      return res.status(404).json({ message: "Not Found", status: false })
    }
    user.status = await "Deactive"
    await user.save()
    return res.status(200).json({ message: "delete successfull!", stutas: true })
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}
export const UpdateUserDetail = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await UserDetail.findById(req.params.id).sort({ sortorder: -1 })
    if (!user) {
      return res.status(404).json({ message: "Not Found", status: false })
    }
    if (req.files) {
      req.files.map(file => {
        if (file.fieldname === "photo") {
          req.body.photo = file.filename
        }
        else {
          req.body.signature = file.filename
        }
      })
    }
    const updatedData = req.body;
    await UserDetail.findByIdAndUpdate(userId, updatedData, { new: true });
    return res.status(200).json({ message: "update data successfull!", stutas: true })
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}

export const SignInWithAdmin = async (req, res, next) => {
  try {
    const { email, password, latitude, longitude, currentAddress, device } = req.body;
    const lati = latitude.toString().slice(0, 7)
    const long = longitude.toString().slice(0, 7)
    let existingAccount = await User.findOne({ email }).populate({
      path: "rolename",
      model: "role",
    });
    if (!existingAccount) {
      return res.status(400).json({ message: "Incorrect email", status: false });
    }
    if (existingAccount && existingAccount.password !== password) {
      return res.status(400).json({ message: "Incorrect password", status: false });
    }
    if (existingAccount?.latitude && existingAccount?.longitude &&
      existingAccount.latitude.toString().slice(0, 7) !== lati &&
      existingAccount.longitude.toString().slice(0, 7) !== long) {
      return res.status(400).json({ message: "location not matched", status: false });
    }
    if (existingAccount.deviceStatus === true) {
      if (existingAccount.device !== device) {
        return res.status(400).json({ message: "device not matched", status: false })
      }
      const token = Jwt.sign({ subject: email }, process.env.TOKEN_SECRET_KEY);
      if (existingAccount) {
        // await User.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
        return res.json({ message: "Login successful", user: { ...existingAccount.toObject(), password: undefined, token }, status: true, });
      }
    } else {
      const token = Jwt.sign({ subject: email }, process.env.TOKEN_SECRET_KEY);
      existingAccount.device = device;
      existingAccount.deviceStatus = true;
      await existingAccount.save()
      if (existingAccount) {
        // await User.updateOne({ email }, { $set: { latitude, longitude, currentAddress } });
        return res.json({ message: "Login successful", user: { ...existingAccount.toObject(), password: undefined, token }, status: true, });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const ViewUserHRM = async (req, res, next) => {
  try {
    const database = req.params.database;
    const adminDetail = await User.find({ database: database }).sort({ sortorder: -1 }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" });
    if (!adminDetail.length > 0) {
      return res.status(400).json({ message: "not found", status: false })
    }
    return adminDetail.length > 0 ? res.status(200).json({ User: adminDetail, status: true }) : res.status(404).json({ error: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const updatePlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate({ path: "subscriptionPlan", model: "subscription" })
    if (!user) {
      return res.status(404).json({ message: "user not found", status: false })
    }
    const userPlan = await User.findOne({ _id: req.params.id, subscriptionPlan: req.body.subscriptionPlan })
    if (userPlan) {
      return res.status(400).json({ message: "this plan already exist !", status: false })
    }
    if (req.body.subscriptionPlan) {
      const sub = await Subscription.findById(req.body.subscriptionPlan)
      if (sub) {
        let perDayAmount = user.billAmount / user.subscriptionPlan.days
        const previousDate = new Date(user.planStart);
        // const { _id, ...subWithoutId } = sub.toObject();
        const date = new Date();
        const differenceInTime = date.getTime() - previousDate.getTime();
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        user.planStart = date;
        user.planEnd = new Date(date.getTime() + (sub.days * 24 * 60 * 60 * 1000));
        user.billAmount = sub.subscriptionCost - (differenceInDays * perDayAmount)
        user.userAllotted = sub.noOfUser
        user.subscriptionPlan = req.body.subscriptionPlan
        await user.save()
        return res.status(200).json({ message: "plan updated successfull!", status: true })
      }
    }
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false })
  }
}


export const customId = async (req, res, next) => {
  try {
    const Model = mongoose.model(req.body.model);
    const existingData = await Model.findById(req.body.id);
    if (!existingData) {
      return res.status(404).json({ message: "Data Not Found", status: false });
    }
    const existingId = await Model.findOne({ database: existingData.database, id: req.body.userId })
    if (existingId) {
      return res.status(404).json({ message: "Id Already Exist", status: false });
    }
    existingData.id = req.body.userId;
    await existingData.save();
    return res.status(200).json({ message: "Data Saved Successfully!", status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};
