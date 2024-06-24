import { Customer } from "../model/customer.model.js";
import { PartyOrderLimit } from "../model/partyOrderLimit.model.js";
import { overDue } from "./overDue.js";

export const checkLimit = async (body) => {
    try {
        const over = await PartyOrderLimit.findOne({ partyId: body.partyId,activeStatus: "Active" }).sort({ sortorder: -1 })
        if (!over) {
            const party = await Customer.findById(body.partyId)
            const remainingAmount = party.limit - body.grandTotal
            body.totalAmount = body.grandTotal
            body.remainingAmount = remainingAmount;
            body.lockingAmount = party.limit
            await PartyOrderLimit.create(body)
            if (body.remainingAmount <= 0) {
                party.autoBillingStatus = "locked";
                await party.save()
                body.dueStatus = "overDue"
                await overDue(body)
            } else {
                await overDue(body)
            }

        } else {
            // const last = over[over.length - 1]
            // console.log(last)
            const party = await Customer.findById(body.partyId)
            const remainingAmount = over.remainingAmount - body.grandTotal
            over.totalAmount = over.totalAmount + body.grandTotal
            over.remainingAmount = remainingAmount;
            over.lockingAmount = party.limit
            await over.save()
            if (over.remainingAmount <= 0) {
                party.autoBillingStatus = "locked";
                await party.save()
                body.dueStatus = "overDue"
                await overDue(body)
            } else {
                await overDue(body)
            }
        }
    }
    catch (err) {
        console.log(err)
    }
};