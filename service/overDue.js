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
                await over.save()
                if (party.remainingLimit > 0) {
                    over.activeStatus = "Deactive"
                    party.remainingLimit = 0
                    await over.save()
                    await party.save()
                }
            } else {
                await over.save()
            }
        }
    }
    catch (err) {
        console.log(err)
    }
};
export const DeleteOverDue = async (body) => {
    try {
        const over = await OverDueReport.findOne({ partyId: body.partyId, activeStatus: "Active" }).sort({ sortorder: -1 })
        if (!over) {
            console.log("Over Due Not Found")
        } else {
            const party = await Customer.findById(body.partyId)
            over.totalPaidAmount = over.totalPaidAmount - body.amount
            over.remainingAmount = over.remainingAmount + body.amount;
            over.voucherNo = body.voucherNo - 1 || over.voucherNo + 1
            if (over.remainingAmount <= 0) {
                party.autoBillingStatus = "open"
                await over.save()
                if (party.remainingLimit) {
                    over.activeStatus = "Deactive"
                    party.remainingLimit = 0
                    await over.save()
                    await party.save()
                }
                await over.save()
            } else {
                await over.save()
            }
        }
    }
    catch (err) {
        console.log(err)
    }
};
export const UpdateOverDue = async (body, previousAmount) => {
    try {
        const over = await OverDueReport.findOne({ partyId: body.partyId, activeStatus: "Active" }).sort({ sortorder: -1 })
        if (!over) {
            console.log("Over Due Not Found")
        } else {
            const party = await Customer.findById(body.partyId)
            over.totalPaidAmount = over.totalPaidAmount + (body.amount - previousAmount)
            over.remainingAmount = over.remainingAmount - (body.amount - previousAmount);
            if (over.remainingAmount <= 0) {
                party.autoBillingStatus = "open"
                await over.save()
                if (party.remainingLimit > 0) {
                    over.activeStatus = "Deactive"
                    party.remainingLimit = 0
                    await over.save()
                    await party.save()
                }
            } else {
                await over.save()
            }
        }
    }
    catch (err) {
        console.log(err)
    }
};