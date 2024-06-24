import { Ledger } from "../model/ledger.model.js";

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