import { Customer } from "../model/customer.model.js";
import { Ledger } from "../model/ledger.model.js";


export const viewLedgerByParty = async (req, res, next) => {
    try {
        const ledger = await Ledger.find({
            $or: [{ userId: req.params.id }, { partyId: req.params.id }, { expenseId: req.params.id }, { transporterId: req.params.id }]
        }).sort({ date: 1, sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "expenseId", model: "createAccount" }).populate({ path: "transporterId", model: "transporter" })
        if (ledger.length === 0) {
            return res.status(404).json({ message: "Not Found", status: false });
        }
        return res.status(200).json({ Ledger: ledger, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};
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
export const viewLedgerByPartySalesApp = async (req, res, next) => {
    try {
        const customer = await Customer.find({created_by:req.params.id})
        if (customer.length === 0) {
            return res.status(404).json({ message: "Customer Not Found", status: false });
        }
        let ledgerData = [];
        for(let items of customer){
            let totalBillAmount = 0;
            let totalReceipt = 0;
            const ledger = await Ledger.find({partyId:items._id}).sort({ date: 1, sortorder: -1 }).populate({ path: "partyId", model: "customer" })
            if (ledger.length === 0) {
               console.log("party ledger not found");
            }
            for(let item of ledger){
                const existingLedger = await ledgerData.find((i)=>i.partyId._id.toString()===item.partyId._id.toString());
                if(existingLedger){
                    if(item.debit){
                        existingLedger.totalBillAmount +=item.debit;
                    }else{
                        existingLedger.totalReceipt +=item.credit;
                    }
                }else{
                    if(item.debit){
                        totalBillAmount = item.debit;
                    }else{
                        totalReceipt = item.credit;
                    }
                    const obj = {
                        partyId:items,
                        totalBillAmount: totalBillAmount,
                        totalReceipt:totalReceipt
                    }
                    ledgerData.push(obj)
                }
            }
        }
        return res.status(200).json({ Ledger: ledgerData, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};