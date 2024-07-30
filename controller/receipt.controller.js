import ExcelJS from "exceljs";
import { Receipt } from "../model/receipt.model.js";
import { ledgerPartyForCredit, ledgerPartyForDebit, ledgerUserForCredit, ledgerUserForDebit } from "../service/ledger.js";
import { Customer } from "../model/customer.model.js";
import { overDue1 } from "../service/overDue.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { SalesReturn } from "../model/salesReturn.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { PurchaseReturn } from "../model/purchaseReturn.model.js";
import { PaymentDueReport } from "../model/payment.due.report.js";
import { OtpVerify } from "../model/otpVerify.model.js";
import { User } from "../model/user.model.js";

export const saveReceipt22 = async (req, res, next) => {
    try {
        if (req.body.partyId) {
            if (req.body.type === "receipt" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "receipt") {
                let particular = "receipt";
                // await ledgerSalesForCredit(req.body, particular)
                await ledgerPartyForCredit(reciept, particular)
                // await ledgerPartyForDebit(req.body, particular)
            }
            await overDue1(req.body)
            req.body.voucherDate = new Date(new Date())
            req.body.lockStatus = "No"
            await PaymentDueReport.create(req.body)
            return reciept ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        } else {
            const reciept = await Receipt.create(req.body);
            return reciept ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const saveReceipt99 = async (req, res, next) => {
    try {
        if (req.body.partyId) {
            if (req.body.type === "receipt" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "receipt") {
                let particular = "receipt";
                await ledgerPartyForCredit(reciept, particular)
            }
            await overDue1(req.body)
            req.body.voucherDate = new Date(new Date())
            req.body.lockStatus = "No"
            await PaymentDueReport.create(req.body)
            return reciept ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
        } else if (!req.body.userId) {
            const reciept = await Receipt.create(req.body);
            return reciept ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
        } else {
            if (req.body.type === "receipt" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", userId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", userId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "receipt") {
                let particular = "receipt";
                await ledgerUserForCredit(reciept, particular)
            }
            // await overDue1(req.body)
            // req.body.voucherDate = new Date(new Date())
            // req.body.lockStatus = "No"
            // await PaymentDueReport.create(req.body)
            return reciept ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const saveReceipt = async (req, res, next) => {
    try {
        const partyReceipt = [];
        for (const item of req.body.Receipt) {
            if (item.partyId) {
                if (item.type === "receipt" && item.paymentMode !== "Cash") {
                    const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                    if (rece.length > 0) {
                        const latestReceipt = rece[rece.length - 1];
                        req.body.runningAmount = latestReceipt.runningAmount + item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = latestReceipt.voucherNo + 1
                    } else {
                        req.body.runningAmount = item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = 1
                    }
                } else {
                    const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                    if (rece.length > 0) {
                        const latestReceipt = rece[rece.length - 1];
                        req.body.cashRunningAmount = latestReceipt.cashRunningAmount + item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = latestReceipt.voucherNo + 1
                    } else {
                        req.body.cashRunningAmount = item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = 1
                    }
                }
                const reciept = await Receipt.create(req.body);
                if (reciept.type === "receipt") {
                    let particular = "receipt";
                    await ledgerPartyForCredit(reciept, particular)
                }
                await overDue1(req.body)
                req.body.voucherDate = new Date(new Date())
                req.body.lockStatus = "No"
                await PaymentDueReport.create(req.body)
                await partyReceipt.push(reciept)
                // return reciept ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
            } else if (!item.userId && !item.partyId) {
                const reciept = await Receipt.create(req.body);
                await partyReceipt.push(reciept)
                // return reciept ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
            } else {
                if (item.type === "receipt" && item.paymentMode !== "Cash") {
                    const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", userId: { $ne: null } }).sort({ sortorder: -1 })
                    if (rece.length > 0) {
                        const latestReceipt = rece[rece.length - 1];
                        req.body.runningAmount = latestReceipt.runningAmount + item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = latestReceipt.voucherNo + 1
                    } else {
                        req.body.runningAmount = item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = 1
                    }
                } else {
                    const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", userId: { $ne: null } }).sort({ sortorder: -1 })
                    if (rece.length > 0) {
                        const latestReceipt = rece[rece.length - 1];
                        req.body.cashRunningAmount = latestReceipt.cashRunningAmount + item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = latestReceipt.voucherNo + 1
                    } else {
                        req.body.cashRunningAmount = item.amount
                        req.body.voucherType = "receipt"
                        req.body.voucherNo = 1
                    }
                }
                const reciept = await Receipt.create(req.body);
                if (reciept.type === "receipt") {
                    let particular = "receipt";
                    await ledgerUserForCredit(reciept, particular)
                }
                await partyReceipt.push(reciept)
                // return reciept ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
            }
        }
        return (partyReceipt.length > 0) ? res.status(200).json({ message: "Receipt Saved Successfull!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const savePayment22 = async (req, res, next) => {
    try {
        if (req.body.partyId) {
            if (req.body.type === "payment" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount - req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount - req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "payment") {
                let particular = "payment";
                // await ledgerSalesForDebit(req.body, particular)
                await ledgerPartyForDebit(reciept, particular)
                // await ledgerPartyForCredit(req.body, particular)
            }
            // await overDue1(req.body)
            return reciept ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        } else {
            const reciept = await Receipt.create(req.body);
            return reciept ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const savePayment = async (req, res, next) => {
    try {
        if (req.body.partyId) {
            if (req.body.type === "payment" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount - req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount - req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "payment") {
                let particular = "payment";
                await ledgerPartyForDebit(reciept, particular)
            }
            return reciept ? res.status(200).json({ message: "Payment Saved Successfull!", status: true }) : res.status(404).json({ message: "Payment Not Found", status: false })
        } else if (!req.body.userId) {
            const reciept = await Receipt.create(req.body);
            return reciept ? res.status(200).json({ message: "Payment Saved Successfull!", status: true }) : res.status(404).json({ message: "Payment Not Found", status: false })
        } else {
            if (req.body.type === "payment" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", userId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount - req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", userId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount - req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "payment"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "payment") {
                let particular = "payment";
                await ledgerUserForDebit(reciept, particular)
            }
            return reciept ? res.status(200).json({ message: "Payment Saved Successfull!", status: true }) : res.status(404).json({ message: "Payment Not Found", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewReceipt = async (req, res, next) => {
    try {
        const receipts = await Receipt.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" });
        // const populatedReceipts = await Promise.all(receipts.map(async (receipt) => {
        //     const customer = await Customer.findOne({ uniqueCode: receipt.code });
        //     return { ...receipt.toObject(), partyId: customer };
        // }));
        return (receipts.length > 0) ? res.status(200).json({ Receipts: receipts, status: true }) : res.status(404).json({ message: "Not Found", status: false });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewReceiptById = async (req, res, next) => {
    try {
        let receipt = await Receipt.findById({ _id: req.params.id }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" });
        // const customer = await Customer.findOne({ uniqueCode: receipt.code }).populate({path:"partyId",model:"customer"});
        // const receipts = { ...receipt.toObject(), partyId: customer };
        return receipt ? res.status(200).json({ Receipts: receipt, status: true }) : res.status(404).json({ error: "Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const DeleteReceipt = async (req, res, next) => {
    try {
        const receipt = await Receipt.findById({ _id: req.params.id });
        if (!receipt) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        receipt.status = "Deactive";
        await receipt.save();
        return res.status(200).json({ message: "delete successful", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const UpdateReceipt = async (req, res, next) => {
    try {
        const receiptId = req.params.id;
        const existingReceipt = await Receipt.findById(receiptId);
        if (!existingReceipt) {
            return res.status(404).json({ error: "receipt not found", status: false });
        } else {
            const updatedReceipt = req.body;
            await Receipt.findByIdAndUpdate(receiptId, updatedReceipt, { new: true });
            return res.status(200).json({ message: "Updated Successfully", status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const saveReceiptWithExcel111 = async (req, res) => {
    try {
        let particular = "receipt";
        let runningAmount = "runningAmount";
        let voucherDate = "voucherDate";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let lockStatus = "lockStatus";
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
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            document[database] = req.params.database
            if (document.partyId) {
                const customer = await Customer.findById({ _id: document.partyId })
                if (customer) {
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "receipt") {
                        let particular = "receipt";
                        // await ledgerSalesForCredit(document, particular)
                        await ledgerPartyForCredit(document, particular)
                        // await ledgerPartyForDebit(document, particular)
                    }
                    await overDue1(document)
                    document[voucherDate] = new Date(new Date())
                    document[lockStatus] = "No"
                    await PaymentDueReport.create(document)
                } else {
                    existingParts.push(document.partyId);
                }
            } else {
                await Receipt.create(document)
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some reciept not exist party: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}

export const savePaymentWithExcel111 = async (req, res) => {
    try {
        let particular = "payment";
        let runningAmount = "runningAmount";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
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
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            document[database] = req.params.database
            if (document.partyId) {
                const customer = await Customer.findById({ _id: document.partyId })
                if (customer) {
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "payment") {
                        let particular = "payment";
                        // await ledgerSalesForDebit(document, particular)
                        await ledgerPartyForDebit(document, particular)
                        // await ledgerPartyForCredit(document, particular)
                    }
                } else {
                    existingParts.push(document.partyId);
                }
            } else {
                await Receipt.create(document)
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some Party not exist: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}

export const ProfitLossReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.date = { $gte: startDate, $lte: endDate };
        }
        const fetchSalesOrders = CreateOrder.find(targetQuery);
        const fetchSalesReturn = SalesReturn.find(targetQuery);
        const fetchPurchaseOrder = PurchaseOrder.find(targetQuery);
        const fetchPurchaseReturn = PurchaseReturn.find(targetQuery);
        const fetchIncome = Receipt.find({ ...targetQuery, type: "receipt" });
        const fetchExpenses = Receipt.find({ ...targetQuery, type: "payment" });

        const [
            salesOrders,
            salesReturn,
            purchaseOrder,
            purchaseReturn,
            income,
            expenses,
        ] = await Promise.all([
            fetchSalesOrders,
            fetchSalesReturn,
            fetchPurchaseOrder,
            fetchPurchaseReturn,
            fetchIncome,
            fetchExpenses,
        ]);

        const calculateTotal = (items, property) => items.reduce((acc, item) => acc + item[property], 0);

        const ProfitLoss = [
            { salesOrders: calculateTotal(salesOrders, 'amount') },
            { salesReturns: calculateTotal(salesReturn, 'Return_amount') },
            { purchasesOrder: calculateTotal(purchaseOrder, 'amount') },
            { purchasesReturn: calculateTotal(purchaseReturn, 'Return_amount') },
            { incomes: calculateTotal(income, 'amount') },
            { expenses: calculateTotal(expenses, 'amount') },
        ];

        return res.status(200).json({ ProfitLoss, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const CashBookReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database, paymentMode: "Cash", status: "Active" };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        const receipts = await Receipt.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" });
        if (receipts.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        return res.status(200).json({ CashBook: receipts, status: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const BankAccountReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database, paymentMode: "Bank", status: "Active" };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        const receipts = await Receipt.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" });
        if (receipts.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        return res.status(200).json({ BankAccount: receipts, status: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const TaxReport = async (req, res, next) => {
    try {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        const targetQuery = { database: req.params.database };
        if (startDate && endDate) {
            targetQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        let orders = [];
        let purchaseTax = 0;
        let salesTax = 0;
        const purchaseOrder = await PurchaseOrder.find(targetQuery)
        if (purchaseOrder.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        const salesOrder = await CreateOrder.find(targetQuery)
        if (salesOrder.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        const purchaseReturn = await PurchaseReturn.find(targetQuery)
        if (purchaseOrder.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        const salesReturn = await SalesReturn.find(targetQuery)
        if (salesOrder.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        const purchaseTaxs = purchaseOrder.concat(salesReturn)
        const salesTaxs = salesOrder.concat(purchaseReturn)
        if (salesTaxs.length > 0) {
            for (let order of purchaseTaxs) {
                if (order.igstTotal === 0) {
                    purchaseTax += order.cgstTotal + order.sgstTotal
                } else {
                    purchaseTax += order.igstTotal
                }
            }
        }
        if (purchaseTaxs.length > 0) {
            for (let order of salesTaxs) {
                if (order.igstTotal === 0) {
                    salesTax += order.cgstTotal + order.sgstTotal
                } else {
                    salesTax += order.igstTotal
                }
            }
        }
        const balanceTax = purchaseTax - salesTax;
        const Tax = {
            totalTaxInput: salesTax,
            totalTaxOut: purchaseTax,
            BalanceTax: balanceTax.toFixed(2)
        }
        return res.status(200).json({ Tax: Tax, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error", status: false })
    }
}


export const saveReceiptWithExcel22 = async (req, res) => {
    try {
        let particular = "receipt";
        let runningAmount = "runningAmount";
        let voucherDate = "voucherDate";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let lockStatus = "lockStatus";
        let partyId = "partyId";
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
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            if (document.partyId) {
                document[database] = req.params.database
                const customer = await Customer.findById({ id: document.partyId, database: document.database })
                if (customer) {
                    document[partyId] = customer._id.toString();
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "receipt") {
                        let particular = "receipt";
                        // await ledgerSalesForCredit(document, particular)
                        await ledgerPartyForCredit(reciept, particular)
                        // await ledgerPartyForDebit(document, particular)
                    }
                    await overDue1(document)
                    document[voucherDate] = new Date(new Date())
                    document[lockStatus] = "No"
                    await PaymentDueReport.create(document)
                } else {
                    existingParts.push(document.partyId);
                }
            } else {
                await Receipt.create(document)
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some reciept not exist valid partyId: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const saveReceiptWithExcel = async (req, res) => {
    try {
        let particular = "receipt";
        let runningAmount = "runningAmount";
        let voucherDate = "voucherDate";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let lockStatus = "lockStatus";
        let partyId = "partyId";
        let userId = "userId";
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
        const existingUsers = [];
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            if (document.partyId) {
                document[database] = req.params.database
                const customer = await Customer.findById({ id: document.partyId, database: document.database })
                if (customer) {
                    document[partyId] = customer._id.toString();
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "receipt") {
                        let particular = "receipt";
                        // await ledgerSalesForCredit(document, particular)
                        await ledgerPartyForCredit(reciept, particular)
                        // await ledgerPartyForDebit(document, particular)
                    }
                    await overDue1(document)
                    document[voucherDate] = new Date(new Date())
                    document[lockStatus] = "No"
                    await PaymentDueReport.create(document)
                } else {
                    existingParts.push(document.partyId);
                }
            } else if (!document.userId) {
                await Receipt.create(document)
            } else {
                document[database] = req.params.database
                const customer = await User.findById({ id: document.userId, database: document.database })
                if (customer) {
                    document[userId] = customer._id.toString();
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", userId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", userId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount + document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "receipt"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "receipt") {
                        let particular = "receipt";
                        // await ledgerSalesForCredit(document, particular)
                        // await ledgerPartyForCredit(document, particular)
                        await ledgerUserForCredit(reciept, particular)
                        // await ledgerPartyForDebit(document, particular)
                    }
                    // await overDue1(document)
                    // document[voucherDate] = new Date(new Date())
                    // document[lockStatus] = "No"
                    // await PaymentDueReport.create(document)
                } else {
                    existingUsers.push(document.partyId);
                }
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some reciept not exist valid partyId: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        } else if (existingUsers.length > 0) {
            message = `Some Receipt Not Exist Valid UserId : ${existingUsers.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const savePaymentWithExcel22 = async (req, res) => {
    try {
        let particular = "payment";
        let runningAmount = "runningAmount";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let partyId = "partyId";
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
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            if (document.partyId) {
                document[database] = req.params.database
                const customer = await Customer.findOne({ id: document.partyId, database: document.database })
                if (customer) {
                    document[partyId] = customer._id.toString();
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "payment") {
                        let particular = "payment";
                        // await ledgerSalesForDebit(document, particular)
                        await ledgerPartyForDebit(reciept, particular)
                        // await ledgerPartyForCredit(document, particular)
                    }
                } else {
                    existingParts.push(document.partyId);
                }
            } else {
                await Receipt.create(document)
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `This Party Not Exist: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const savePaymentWithExcel = async (req, res) => {
    try {
        let particular = "payment";
        let runningAmount = "runningAmount";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let partyId = "partyId";
        let userId = "userId";
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
        const existingUsers = [];
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            if (document.partyId) {
                document[database] = req.params.database
                const customer = await Customer.findOne({ id: document.partyId, database: document.database })
                if (customer) {
                    document[partyId] = customer._id.toString();
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "payment") {
                        let particular = "payment";
                        // await ledgerSalesForDebit(document, particular)
                        await ledgerPartyForDebit(reciept, particular)
                        // await ledgerPartyForCredit(document, particular)
                    }
                } else {
                    existingParts.push(document.partyId);
                }
            } else if (!document.userId) {
                await Receipt.create(document)
            } else {
                document[database] = req.params.database
                const customer = await User.findOne({ id: document.userId, database: document.database })
                if (customer) {
                    document[userId] = customer._id.toString();
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", userId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[runningAmount] = latestReceipt.runningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[runningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", userId: { $ne: null } }).sort({ sortorder: -1 })
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[cashRunningAmount] = latestReceipt.cashRunningAmount - document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[cashRunningAmount] = document.amount
                            document[voucherType] = "payment"
                            document[voucherNo] = 1
                        }
                    }
                    const reciept = await Receipt.create(document);
                    if (reciept.type === "payment") {
                        let particular = "payment";
                        // await ledgerSalesForDebit(document, particular)
                        // await ledgerPartyForDebit(document, particular)
                        // await ledgerPartyForCredit(document, particular)
                        await ledgerUserForDebit(reciept, particular)
                    }
                } else {
                    existingUsers.push(document.partyId);
                }
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `This Party Not Exist: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        } else if (existingUsers.length > 0) {
            message = `This User Not Exist: ${existingUsers.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}

export const PartySendOtp = async (req, res, next) => {
    try {
        // if (!req.body.otp) {
        //     return res.status(400).json({ message: "otp required", status: false })
        // }
        // const existingOtp = await OtpVerify.findOne({ otp: req.body.otp })
        // if (!existingOtp) {
        //     return res.status(404).json({ message: "otp don't matched..", status: false })
        // }
        // req.body.status = "Deactive"
        if (req.body.partyId) {
            if (req.body.type === "receipt" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.runningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            }
            const reciept = await Receipt.create(req.body);
            if (reciept.type === "receipt") {
                let particular = "receipt";
                // await ledgerSalesForCredit(req.body, particular)
                await ledgerPartyForCredit(req.body, particular)
                // await ledgerPartyForDebit(req.body, particular)
            }
            await overDue1(req.body)
            req.body.voucherDate = new Date(new Date())
            req.body.lockStatus = "No"
            await PaymentDueReport.create(req.body)
            await OtpVerify.create(req.body)
            return reciept ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        } else {
            return res.status(404).json({ message: "PartyId Required..", status: false })
            // const reciept = await Receipt.create(req.body);
            // return reciept ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const VerifyPartyPayment = async (req, res, next) => {
    try {
        const existingParty = await Receipt.findOne({ otp: req.body.otp })
        if (!existingParty) {
            return res.status(404).json({ message: "otp don't not matched..", status: false })
        }
        if (existingParty.partyId !== req.params.partyId) {
            return res.status(404).json({ message: "Party Not Found", status: false })
        }
        existingParty.status = "Active"
        req.body.type = existingParty.type
        req.body.paymentMode = existingParty.paymentMode
        req.body.amount = existingParty.amount
        if (req.body.type === "receipt" && req.body.paymentMode !== "Cash") {
            const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
            if (rece.length > 0) {
                const latestReceipt = rece[rece.length - 1];
                req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                req.body.voucherType = "receipt"
                req.body.voucherNo = latestReceipt.voucherNo + 1
            } else {
                req.body.runningAmount = req.body.amount
                req.body.voucherType = "receipt"
                req.body.voucherNo = 1
            }
        } else {
            const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
            if (rece.length > 0) {
                const latestReceipt = rece[rece.length - 1];
                req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                req.body.voucherType = "receipt"
                req.body.voucherNo = latestReceipt.voucherNo + 1
            } else {
                req.body.cashRunningAmount = req.body.amount
                req.body.voucherType = "receipt"
                req.body.voucherNo = 1
            }
        }
        // const reciept = await Receipt.create(req.body);
        await existingParty.save()
        if (req.body.type === "receipt") {
            let particular = "receipt";
            // await ledgerSalesForCredit(req.body, particular)
            await ledgerPartyForCredit(req.body, particular)
            // await ledgerPartyForDebit(req.body, particular)
        }
        await overDue1(req.body)
        req.body.voucherDate = new Date(new Date())
        req.body.lockStatus = "No"
        await PaymentDueReport.create(req.body)
        return res.status(200).json({ message: "data save successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const SaveOtp = async (req, res) => {
    try {
        if (!req.body.otp) {
            return res.status(404).json({ message: "otp required", status: false })
        }
        const existing = await OtpVerify.findOne({ partyId: req.body.partyId, userId: req.body.userId })
        if (!existing) {
            await OtpVerify.create(req.body)
        } else {
            existing.otp = req.body.otp;
            existing.amount = req.body.amount;
            await existing.save()
        }
        return res.status(200).json({ message0: "data saved successfull!", status: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const ViewOtp = async (req, res) => {
    const { userId, partyId } = req.body;
    try {
        const query = { $or: [{ userId }, { partyId }] };
        const orderData = await OtpVerify.findOne(query)
        if (orderData) {
            return res.status(200).json({ otp: orderData, status: true });
        } else {
            return res.status(404).json({ message: 'otp not found', status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
export const OtpVerifyForReceipt = async (req, res) => {
    try {
        if (!req.body.otp) {
            return res.status(400).json({ message: "otp required", status: false })
        }
        const existingOtp = await OtpVerify.findOne({ partyId: req.body.partyId, otp: req.body.otp })
        if (!existingOtp) {
            return res.status(404).json({ message: "maybe partyId or otp don't correct", status: false })
        }
        await OtpVerify.findOneAndDelete({ otp: req.body.otp })
        return res.status(200).json({ message: "otp verified successfull!", status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewReceiptByPartyId = async (req, res, next) => {
    try {
        let receipt = await Receipt.find({ database: req.params.database, partyId: req.params.id }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" });
        // const customer = await Customer.findOne({ uniqueCode: receipt.code }).populate({path:"partyId",model:"customer"});
        // const receipts = { ...receipt.toObject(), partyId: customer };
        return (receipt.length > 0) ? res.status(200).json({ Receipts: receipt, status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

// --------------------------------------------------------------------

// For DashBoard
export const transactionCalculate11 = async (req, res, next) => {
    try {
        let transaction = {
            BankAmount: 0,
            CashAmount: 0,
            marketOutstanding: 0,
        };
        let creditAmount = 0;
        let debitAmount = 0;
        let creditAmounts = 0;
        let debitAmounts = 0;
        const receipts = await Receipt.find({ database: req.params.database, paymentMode: "Bank", status: "Active" }).sort({ sortorder: -1 })
        const receipt = await Receipt.find({ database: req.params.database, paymentMode: "Cash", status: "Active" }).sort({ sortorder: -1 })
        if (receipts.length === 0) {
            return res.status(404).json({ message: "Bank and Cash Balance Not Found", status: false })
        }
        if (receipt.length === 0) {
            return res.status(404).json({ message: "Bank and Cash Balance Not Found", status: false })
        }
        receipts.forEach(item => {
            if (item.type === "receipt") {
                creditAmount += item.amount
            } else if (item.type === "payment") {
                debitAmount += item.amount
            }
        })
        transaction.BankAmount = (creditAmount - debitAmount)
        receipt.forEach(item => {
            if (item.type === "receipt") {
                creditAmounts += item.amount
            } else if (item.type === "payment") {
                debitAmounts += item.amount
            }
        })
        transaction.CashAmount = (creditAmounts - debitAmounts)
        res.status(200).json({ transaction, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error", status: false })
    }
}
export const transactionCalculate = async (req, res, next) => {
    try {
        let transaction = {
            BankAmount: 0,
            CashAmount: 0,
            marketOutstanding: 0,
        };
        let creditAmountBank = 0;
        let debitAmountBank = 0;
        let creditAmountCash = 0;
        let debitAmountCash = 0;
        const receipts = await Receipt.find({ database: req.params.database, status: "Active", paymentMode: { $in: ["Bank", "Cash"] } }).sort({ sortorder: -1 });
        if (receipts.length === 0) {
            return res.status(404).json({ message: "Bank and Cash Balance Not Found", status: false });
        }
        receipts.forEach(item => {
            if (item.paymentMode === "Bank") {
                if (item.type === "receipt") {
                    creditAmountBank += item.amount;
                } else if (item.type === "payment") {
                    debitAmountBank += item.amount;
                }
            } else if (item.paymentMode === "Cash") {
                if (item.type === "receipt") {
                    creditAmountCash += item.amount;
                } else if (item.type === "payment") {
                    debitAmountCash += item.amount;
                }
            }
        });
        transaction.BankAmount = creditAmountBank - debitAmountBank;
        transaction.CashAmount = creditAmountCash - debitAmountCash;

        res.status(200).json({ transaction, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", status: false });
    }
};
