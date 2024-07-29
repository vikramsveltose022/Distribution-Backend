import { CreateOrder } from "../model/createOrder.model.js";
import { Ledger } from "../model/ledger.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { Receipt } from "../model/receipt.model.js";


export const viewLedgerByParty = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const ledger = await Ledger.find({ partyId: userId, ledgerType: "party" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" })
        if (!ledger.length > 0) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ Ledger: ledger, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewLedgerByUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const ledger = await Ledger.find({ userId: userId, ledgerType: "user" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" })
        if (!ledger.length > 0) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        return res.status(200).json({ Ledger: ledger, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewLastLedgerBalance = async (req, res, next) => {
    try {
        const partyId = req.params.id;
        const ledger = await Ledger.find({ partyId: partyId, ledgerType: "party" }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" })
        if (ledger.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        let lastLedgerBalance = ledger[ledger.length - 1]

        return res.status(200).json({ Ledger: lastLedgerBalance, status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const LedgerList = async (req, res, next) => {
    try {
        let ledger = {
            creditBalance: 0,
            debitBalance: 0,
            totalCreditBalance: 0,
            totalDebitBalance: 0,
            closingBalance: 0
        }
        const salesOrders = await CreateOrder.find({ partyId: req.params.id, database: req.params.database, status: "Completed" })
        if (salesOrders.length === 0) {
            // return res.status(404).json({ message: "SalesOrder Not Found", status: false })
        }
        if (salesOrders.length > 0) {
            salesOrders.forEach(item => {
                console.log(item.grandTotal)
                ledger.debitBalance += item.grandTotal
            });
        }
        const receipt = await Receipt.find({ partyId: req.params.id, database: req.params.database })
        receipt.forEach(item => {
            console.log("dddd")
            console.log(item.amount)
            ledger.debitBalance += item.amount
        });
        const purchaseOrders = await PurchaseOrder.find({ partyId: req.params.id, database: req.params.database, status: "Completed" })
        return res.status(200).json({ Ledger: ledger, status: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}