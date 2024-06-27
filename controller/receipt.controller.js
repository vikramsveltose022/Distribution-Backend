import ExcelJS from "exceljs";
import { Receipt } from "../model/receipt.model.js";
import { ledgerPartyForCredit, ledgerPartyForDebit, ledgerSalesForCredit, ledgerSalesForDebit } from "../service/ledger.js";
import { Customer } from "../model/customer.model.js";
import { overDue1 } from "../service/overDue.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { SalesReturn } from "../model/salesReturn.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { PurchaseReturn } from "../model/purchaseReturn.model.js";
import { PaymentDueReport } from "../model/payment.due.report.js";

export const saveReceipt = async (req, res, next) => {
    try {
        if (req.body.partyId) {
            if (req.body.type === "receipt" && req.body.paymentMode !== "Cash") {
                const rece = await Receipt.find({ paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                const rece = await Receipt.find({ paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                const rece = await Receipt.find({ paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                const rece = await Receipt.find({ paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                await ledgerPartyForDebit(req.body, particular)
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
export const viewReceipt = async (req, res, next) => {
    try {
        const receipts = await Receipt.find({ database: req.params.database, status: "Active" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" });;
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

export const saveReceiptWithExcel = async (req, res) => {
    try {
        let particular = "receipt";
        let runningAmount = "runningAmount";
        let voucherDate = "voucherDate";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let lockStatus = "lockStatus";
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
                const customer = await Customer.findById({ _id: document.partyId })
                if (customer) {
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                        const rece = await Receipt.find({ paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
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

export const savePaymentWithExcel = async (req, res) => {
    try {
        let particular = "payment";
        let runningAmount = "runningAmount";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
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
                const customer = await Customer.findById({ _id: document.partyId })
                if (customer) {
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                        const rece = await Receipt.find({ paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
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


export const saveReceiptWithExcel111 = async (req, res) => {
    try {
        let particular = "receipt";
        let runningAmount = "runningAmount";
        let voucherDate = "voucherDate";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let lockStatus = "lockStatus";
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
                const customer = await Customer.findById({ _id: document.partyId })
                if (customer) {
                    document[partyId] = customer._id;
                    if (document.type === "receipt" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                        const rece = await Receipt.find({ paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
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

export const savePaymentWithExcel11 = async (req, res) => {
    try {
        let particular = "payment";
        let runningAmount = "runningAmount";
        let voucherNo = "voucherNo";
        let voucherType = "voucherType";
        let cashRunningAmount = "cashRunningAmount";
        let partyId = "partyId"
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
                // console.log("id : " + document.partyId)
                const customer = await Customer.findOne({ id: document.partyId, database: document.database })
                if (customer) {
                    document[partyId] = customer._id;
                    // console.log("_id : " + document.partyId)
                    if (document.type === "payment" && document.paymentMode !== "Cash") {
                        const rece = await Receipt.find({ paymentMode: "Bank", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
                        const rece = await Receipt.find({ paymentMode: "Cash", partyId: { $ne: null } }).sort({ sortorder: -1 })
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
