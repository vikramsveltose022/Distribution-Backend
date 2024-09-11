import ExcelJS from "exceljs";
import { Receipt } from "../model/receipt.model.js";
import { ledgerExpensesForCredit, ledgerExpensesForDebit, ledgerPartyForCredit, ledgerPartyForDebit, ledgerTransporterForCredit, ledgerTransporterForDebit, ledgerUserForCredit, ledgerUserForDebit } from "../service/ledger.js";
import { Customer } from "../model/customer.model.js";
import { DeleteOverDue, UpdateOverDue, overDue1 } from "../service/overDue.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { SalesReturn } from "../model/salesReturn.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { PurchaseReturn } from "../model/purchaseReturn.model.js";
import { PaymentDueReport } from "../model/payment.due.report.js";
import { OtpVerify } from "../model/otpVerify.model.js";
import { User } from "../model/user.model.js";
import { Ledger } from "../model/ledger.model.js";
import { CreateAccount } from "../model/createAccount.model.js";


export const saveReceipt = async (req, res, next) => {
    try {
        const partyReceipt = [];
        for (const item of req.body.Receipt) {
            const isBankPayment = item.paymentMode !== "Cash";
            const paymentMode = isBankPayment ? 'Bank' : 'Cash';
            const rece = await Receipt.find({ status: "Active", paymentMode, }).sort({ sortorder: -1 });
            if (rece.length > 0) {
                const latestReceipt = rece[rece.length - 1];
                if (isBankPayment) {
                    // req.body.runningAmount = latestReceipt.runningAmount + item.amount;
                } else {
                    // req.body.cashRunningAmount = latestReceipt.cashRunningAmount + item.amount;
                }
                req.body.voucherNo = latestReceipt.voucherNo + 1;
            } else {
                if (isBankPayment) {
                    // req.body.runningAmount = item.amount;
                } else {
                    // req.body.cashRunningAmount = item.amount;
                }
                req.body.voucherNo = 1;
            }
            req.body.voucherType = "receipt";
            req.body.voucherDate = new Date();
            req.body.lockStatus = "No";
            const receiptData = { ...req.body, ...item };
            const receipt = await Receipt.create(receiptData);
            if (receipt.type === "receipt") {
                const particular = receipt.paymentMode + " " + "receipt";
                if (item.partyId) {
                    await ledgerPartyForCredit(receipt, particular);
                } else if (item.userId) {
                    await ledgerUserForCredit(receipt, particular);
                } else if (item.expenseId) {
                    await ledgerExpensesForCredit(receipt, particular);
                } else {
                    await ledgerTransporterForCredit(receipt, particular)
                }
            }
            if (item.partyId) {
                req.body.orderId = receipt._id.toString()
                const receiptData = { ...req.body, ...item };
                await overDue1(receiptData);
                await PaymentDueReport.create(receiptData);
            }
            await partyReceipt.push(receipt);
        }
        return (partyReceipt.length > 0) ? res.status(200).json({ message: "Receipt Saved Successfully!", status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const UpdateReceipt = async (req, res, next) => {
    try {
        const existingReceipt = await Receipt.findById(req.params.id);
        if (!existingReceipt) {
            return res.status(404).json({ message: "Receipt Not Found", status: false });
        }
        let previousamount = existingReceipt.amount;
        req.body.voucherType = "receipt";
        req.body.voucherDate = new Date();
        req.body.lockStatus = "No";
        // if (req.body.partyId) {
        //     req.body.userId = undefined;
        //     req.body.expenseId = undefined;
        // } else if (req.body.userId) {
        //     req.body.partyId = undefined;
        //     req.body.expenseId = undefined;
        // } else {
        //     req.body.userId = undefined;
        //     req.body.partyId = undefined;
        // }
        const updatedReceipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedReceipt.type === "receipt") {
            const particular = "receipt";
            if (updatedReceipt.partyId) {
                req.body.credit = updatedReceipt.amount;
                await Ledger.findOneAndUpdate({ orderId: existingReceipt._id.toString() }, req.body, { new: true });
            } else if (updatedReceipt.userId) {
                req.body.credit = updatedReceipt.amount;
                await Ledger.findOneAndUpdate({ orderId: existingReceipt._id.toString() }, req.body, { new: true });
            }
        }
        if (updatedReceipt.partyId) {
            await UpdateOverDue(req.body, previousamount);
            await PaymentDueReport.findOneAndUpdate({ orderId: existingReceipt._id.toString() }, req.body, { new: true });
        }
        return res.status(200).json({ message: "Receipt Updated Successfully!", status: true, receipt: updatedReceipt });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const viewReceipt = async (req, res, next) => {
    try {
        const receipts = await Receipt.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "expenseId", model: "createAccount" }).populate({ path: "transporterId", model: "transporter" });
        return (receipts.length > 0) ? res.status(200).json({ Receipts: receipts, status: true }) : res.status(404).json({ message: "Not Found", status: false });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
export const ViewReceiptById = async (req, res, next) => {
    try {
        let receipt = await Receipt.findById({ _id: req.params.id }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "expenseId", model: "createAccount" }).populate({ path: "transporterId", model: "transporter" })
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
        await Ledger.findOneAndDelete({ orderId: req.params.id })
        await PaymentDueReport.findOneAndDelete({ orderId: req.params.id })
        if (receipt.partyId && receipt.type === "receipt") {
            await DeleteOverDue(receipt)
        }
        return res.status(200).json({ message: "delete successful", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const savePayment = async (req, res, next) => {
    try {
        const partyReceipt = [];
        for (const item of req.body.Payment) {
            let query = { status: "Active" };
            let isBankPayment = item.type === "payment" && item.paymentMode !== "Cash";
            query.paymentMode = isBankPayment ? "Bank" : "Cash";
            const rece = await Receipt.find(query).sort({ sortorder: -1 });
            if (rece.length > 0) {
                const latestReceipt = rece[rece.length - 1];
                if (isBankPayment) {
                    // req.body.runningAmount = latestReceipt.runningAmount - item.amount;
                } else {
                    // req.body.cashRunningAmount = latestReceipt.cashRunningAmount - item.amount;
                }
                req.body.voucherNo = latestReceipt.voucherNo + 1;
            } else {
                if (isBankPayment) {
                    // req.body.runningAmount = item.amount;
                } else {
                    // req.body.cashRunningAmount = item.amount;
                }
                req.body.voucherNo = 1;
            }
            req.body.voucherType = "payment";
            const receiptData = { ...req.body, ...item };
            const receipt = await Receipt.create(receiptData);
            if (receipt.type === "payment") {
                const particular = receipt.paymentMode + " " + "payment";
                if (item.partyId) {
                    await ledgerPartyForDebit(receipt, particular);
                } else if (item.userId) {
                    await ledgerUserForDebit(receipt, particular);
                } else if (item.expenseId) {
                    await ledgerExpensesForDebit(receipt, particular)
                } else {
                    await ledgerTransporterForDebit(receipt, particular)
                }
            }
            partyReceipt.push(receipt);
        }
        return partyReceipt.length > 0 ? res.status(200).json({ message: "Payment Saved Successfully!", status: true }) : res.status(404).json({ message: "Payment Not Found", status: false });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const UpdatePayment = async (req, res, next) => {
    try {
        const existingReceipt = await Receipt.findById(req.params.id);
        if (!existingReceipt) {
            return res.status(404).json({ message: "Payment Not Found", status: false });
        }
        req.body.voucherType = "payment";
        // if (req.body.partyId) {
        //     req.body.userId = undefined;
        //     req.body.expenseId = undefined;
        // } else if (req.body.userId) {
        //     req.body.partyId = undefined;
        //     req.body.expenseId = undefined;
        // } else {
        //     req.body.userId = undefined;
        //     req.body.partyId = undefined;
        // }
        const updatedReceipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedReceipt.type === "payment") {
            const particular = "payment";
            if (updatedReceipt.partyId) {
                req.body.credit = updatedReceipt.amount;
                await Ledger.findOneAndUpdate({ orderId: existingReceipt._id.toString() }, req.body, { new: true });
            } else if (updatedReceipt.userId) {
                req.body.credit = updatedReceipt.amount;
                await Ledger.findOneAndUpdate({ orderId: existingReceipt._id.toString() }, req.body, { new: true });
            }
        }
        return res.status(200).json({ message: "Payment Updated Successfully!", status: true, receipt: updatedReceipt });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeletePayment = async (req, res, next) => {
    try {
        const receipt = await Receipt.findById({ _id: req.params.id });
        if (!receipt) {
            return res.status(404).json({ error: "Payment Not Found", status: false });
        }
        receipt.status = "Deactive";
        await receipt.save();
        await Ledger.findOneAndDelete({ orderId: req.params.id })
        return res.status(200).json({ message: "Payment Delete Successfull!", status: true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const saveReceiptWithExcel = async (req, res) => {
    try {
        let voucherDate = "voucherDate";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let lockStatus = "lockStatus";
        let partyId = "partyId";
        let transporterId = "transporterId";
        let userId = "userId";
        let database = "database";
        let type = "type"
        let expenseId = "expenseId"
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
        const existingExpenses = [];
        const notExistCode = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            document[type] = (document.type === "receipt") ? "receipt" : "receipt";
            document[database] = req.params.database
            if (document.partyId) {
                const customer = await Customer.findOne({ id: document.partyId, database: document.database })
                if (customer) {
                    document[userId] = undefined
                    document[expenseId] = undefined
                    document[transporterId] = undefined
                    document[partyId] = customer._id.toString();
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank", }).sort({ sortorder: -1 })
                        document[voucherType] = "receipt"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
                        document[voucherType] = "receipt"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    }
                    const receipt = await Receipt.create(document);
                    if (receipt.type === "receipt") {
                        let particular = receipt.paymentMode + " " + "receipt";
                        await ledgerPartyForCredit(receipt, particular)
                    }
                    await overDue1(document)
                    document[voucherDate] = new Date(new Date())
                    document[lockStatus] = "No"
                    await PaymentDueReport.create(document)
                } else {
                    existingParts.push(document.partyId);
                }
            } else if (!document.userId && !document.partyId) {
                const expense = await CreateAccount.findOne({ id: document.expenseId, database: document.database })
                if (expense) {
                    document[userId] = undefined;
                    document[partyId] = undefined
                    document[transporterId] = undefined
                    document[expenseId] = expense._id.toString()
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
                        document[voucherType] = "receipt"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
                        document[voucherType] = "receipt"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    }
                    const receipt = await Receipt.create(document)
                    if (receipt.type === "receipt") {
                        let particular = receipt.paymentMode + " " + "receipt";
                        await ledgerExpensesForCredit(receipt, particular);
                    }
                } else {
                    await existingExpenses.push(document.expenseId)
                }
            } else {
                document[database] = req.params.database
                const customer = await User.findOne({ id: document.userId, database: document.database })
                if (customer) {
                    document[partyId] = undefined
                    document[expenseId] = undefined
                    document[transporterId] = undefined
                    document[userId] = customer._id.toString();
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
                        document[voucherType] = "receipt"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
                        document[voucherType] = "receipt"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    }
                    const receipt = await Receipt.create(document);
                    if (receipt.type === "receipt") {
                        let particular = receipt.paymentMode + " " + "receipt";
                        await ledgerUserForCredit(receipt, particular)
                    }
                } else {
                    existingUsers.push(document.userId);
                }
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some receipt not exist valid partyId: ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        } else if (existingUsers.length > 0) {
            message = `Some Receipt Not Exist Valid UserId : ${existingUsers.join(', ')}`;
        } else if (existingExpenses.length > 0) {
            message = `Some Receipt Not Exist Valid Expenses : ${existingExpenses.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const savePaymentWithExcel = async (req, res) => {
    try {
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let partyId = "partyId";
        let userId = "userId";
        let database = "database";
        let type = "type"
        let expenseId = "expenseId"
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
        const existingExpenses = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            document[type] = (document.type === "payment") ? "payment" : "payment";
            document[database] = req.params.database
            if (document.partyId) {
                const customer = await Customer.findOne({ id: document.partyId, database: document.database })
                if (customer) {
                    document[userId] = undefined
                    document[expenseId] = undefined
                    document[partyId] = customer._id.toString();
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
                        document[voucherType] = "payment"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash", }).sort({ sortorder: -1 })
                        document[voucherType] = "payment"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    }
                    const receipt = await Receipt.create(document);
                    if (receipt.type === "payment") {
                        let particular = receipt.paymentMode + " " + "payment";
                        await ledgerPartyForDebit(receipt, particular)
                    }
                } else {
                    existingParts.push(document.partyId);
                }
            } else if (!document.userId && !document.partyId) {
                const expense = await CreateAccount.findOne({ id: document.expenseId, database: document.database })
                if (expense) {
                    document[userId] = undefined;
                    document[partyId] = undefined
                    document[expenseId] = expense._id.toString()
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
                        document[voucherType] = "payment"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
                        document[voucherType] = "payment"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    }
                    const receipt = await Receipt.create(document)
                    if (receipt.type === "payment") {
                        let particular = receipt.paymentMode + " " + "payment";
                        await ledgerExpensesForDebit(receipt, particular)
                    }
                } else {
                    await existingExpenses.push(document.expenseId)
                }
            } else {
                document[database] = req.params.database
                const customer = await User.findOne({ id: document.userId, database: document.database })
                if (customer) {
                    document[partyId] = undefined
                    document[expenseId] = undefined
                    document[userId] = customer._id.toString();
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
                        document[voucherType] = "payment"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    } else {
                        const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
                        document[voucherType] = "payment"
                        if (rece.length > 0) {
                            const latestReceipt = rece[rece.length - 1];
                            document[voucherNo] = latestReceipt.voucherNo + 1
                        } else {
                            document[voucherNo] = 1
                        }
                    }
                    const receipt = await Receipt.create(document);
                    if (receipt.type === "payment") {
                        let particular = receipt.paymentMode + " " + "payment";
                        await ledgerUserForDebit(receipt, particular)
                    }
                } else {
                    existingUsers.push(document.partyId);
                }
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingParts.length > 0) {
            message = `Some Payment Not Exist Valid PartyId : ${existingParts.join(', ')}`;
        } else if (notExistCode.length > 0) {
            message = `Write code fields in these notes: ${notExistCode.join(', ')}`;
        } else if (existingUsers.length > 0) {
            message = `Some Payment Not Exist Valid UserId: ${existingUsers.join(', ')}`;
        } else if (existingExpenses.length > 0) {
            message = `Some Payment Not Exist Valid ExpenseId : ${existingExpenses.join(', ')}`;
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
        const receipts = await Receipt.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "expenseId", model: "createAccount" }).populate({ path: "transporterId", model: "transporter" });
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
        const receipts = await Receipt.find(targetQuery).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "expenseId", model: "createAccount" }).populate({ path: "transporterId", model: "transporter" });
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
}

// For App
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
                const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    // req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    // req.body.runningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            } else {
                const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
                if (rece.length > 0) {
                    const latestReceipt = rece[rece.length - 1];
                    // req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = latestReceipt.voucherNo + 1
                } else {
                    // req.body.cashRunningAmount = req.body.amount
                    req.body.voucherType = "receipt"
                    req.body.voucherNo = 1
                }
            }
            const receipt = await Receipt.create(req.body);
            if (receipt.type === "receipt") {
                let particular = req.body.paymentMode + " " + "receipt";
                await ledgerPartyForCredit(receipt, particular)
            }
            req.body.orderId = receipt._id.toString()
            await overDue1(req.body)
            req.body.voucherDate = new Date(new Date())
            req.body.lockStatus = "No"
            await PaymentDueReport.create(req.body)
            return receipt ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
        } else {
            return res.status(404).json({ message: "PartyId Required..", status: false })
            // const receipt = await Receipt.create(req.body);
            // return receipt ? res.status(200).json({ message: "data save successfull", status: true }) : res.status(404).json({ message: "Not Found", status: false })
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
            const rece = await Receipt.find({ status: "Active", paymentMode: "Bank" }).sort({ sortorder: -1 })
            if (rece.length > 0) {
                const latestReceipt = rece[rece.length - 1];
                // req.body.runningAmount = latestReceipt.runningAmount + req.body.amount
                req.body.voucherType = "receipt"
                req.body.voucherNo = latestReceipt.voucherNo + 1
            } else {
                // req.body.runningAmount = req.body.amount
                req.body.voucherType = "receipt"
                req.body.voucherNo = 1
            }
        } else {
            const rece = await Receipt.find({ status: "Active", paymentMode: "Cash" }).sort({ sortorder: -1 })
            if (rece.length > 0) {
                const latestReceipt = rece[rece.length - 1];
                // req.body.cashRunningAmount = latestReceipt.cashRunningAmount + req.body.amount
                // req.body.voucherType = "receipt"
                req.body.voucherNo = latestReceipt.voucherNo + 1
            } else {
                // req.body.cashRunningAmount = req.body.amount
                // req.body.voucherType = "receipt"
                req.body.voucherNo = 1
            }
        }
        // const receipt = await Receipt.create(req.body);
        await existingParty.save()
        if (req.body.type === "receipt") {
            let particular = req.body.paymentMode + " receipt";
            await ledgerPartyForCredit(req.body, particular)
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
        let receipt = await Receipt.find({ database: req.params.database, partyId: req.params.id }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" })
        // const customer = await Customer.findOne({ uniqueCode: receipt.code }).populate({path:"partyId",model:"customer"});
        // const receipts = { ...receipt.toObject(), partyId: customer };
        return (receipt.length > 0) ? res.status(200).json({ Receipts: receipt, status: true }) : res.status(404).json({ message: "Receipt Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};