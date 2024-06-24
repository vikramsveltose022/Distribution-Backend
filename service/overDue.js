import { Customer } from "../model/customer.model.js";
import { OverDueReport } from "../model/overDue.mode.js";
import { PartyOrderLimit } from "../model/partyOrderLimit.model.js";

export const overDue = async (body) => {
    try {
        const over = await OverDueReport.findOne({ partyId: body.partyId, activeStatus: "Active" }).sort({ sortorder: -1 })
        if (!over) {
            body.remainingAmount = body.grandTotal;
            body.totalOrderAmount = body.grandTotal
            body.voucherNo = 1;
            body.voucherDate = new Date(new Date())
            await OverDueReport.create(body)
        } else {
            over.remainingAmount = over.remainingAmount + body.grandTotal;
            over.totalOrderAmount = over.totalOrderAmount + body.grandTotal
            over.dueStatus = body.dueStatus || over.dueStatus
            over.voucherNo = over.voucherNo + 1
            over.voucherDate = new Date(new Date())
            await over.save()
        }
    }
    catch (err) {
        console.log(err)
    }
};

export const overDue1 = async (body) => {
    try {
        const over = await OverDueReport.findOne({ partyId: body.partyId, activeStatus: "Active" }).sort({ sortorder: -1 })
        const over1 = await PartyOrderLimit.findOne({ partyId: body.partyId, activeStatus: "Active" })
        if (!over) {
            body.remainingAmount = body.amount;
            body.totalPaidAmount = body.amount
            body.voucherNo = body.voucherNo || 1;
            body.voucherDate = new Date(new Date())
            await OverDueReport.create(body)
        } else {
            const party = await Customer.findById(body.partyId)
            over.totalPaidAmount = over.totalPaidAmount + body.amount
            over.remainingAmount = over.remainingAmount - body.amount;
            over.voucherNo = body.voucherNo || over.voucherNo + 1
            over.voucherDate = new Date(new Date())
            if (over.remainingAmount <= 0) {
                party.autoBillingStatus = "open"
                await party.save()
                over.activeStatus = "Deactive"
                await over.save()
                await over1.save()
            } else {
                await over.save()
            }
        }
    }
    catch (err) {
        console.log(err)
    }
};   