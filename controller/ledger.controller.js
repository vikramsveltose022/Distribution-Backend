import { Ledger } from "../model/ledger.model.js";


export const viewLedgerByParty = async (req, res, next) => {
    try {
        const ledger = await Ledger.find({
            $or: [{ userId: req.params.id }, { partyId: req.params.id }, { expenseId: req.params.id }, { transporterId: req.params.id }]
        }).sort({ sortorder: -1 }).populate({ path: "partyId", model: "customer" }).populate({ path: "userId", model: "user" }).populate({ path: "expenseId", model: "createAccount" }).populate({ path: "transporterId", model: "transporter" })
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