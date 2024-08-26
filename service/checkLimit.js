import { Customer } from "../model/customer.model.js";
import { OverDueReport } from "../model/overDue.mode.js";
import { PartyOrderLimit } from "../model/partyOrderLimit.model.js";
import { overDue } from "./overDue.js";

// export const checkLimit = async (body) => {
//     try {
//         const over = await PartyOrderLimit.findOne({ partyId: body.partyId, activeStatus: "Active" })
//         if (!over) {
//             const party = await Customer.findById(body.partyId)
//             const remainingAmount = party.limit - body.grandTotal
//             body.totalAmount = body.grandTotal
//             body.remainingAmount = remainingAmount;
//             body.lockingAmount = party.limit
//             await PartyOrderLimit.create(body)
//             if (body.remainingAmount <= 0) {
//                 party.autoBillingStatus = "locked";
//                 await party.save()
//                 body.dueStatus = "overDue"
//                 await overDue(body)
//             } else {
//                 await overDue(body)
//             }
//         } else {
//             // const last = over[over.length - 1]
//             // console.log(last)
//             const party = await Customer.findById(body.partyId)
//             const remainingAmount = over.remainingAmount - body.grandTotal
//             over.totalAmount = over.totalAmount + body.grandTotal
//             over.remainingAmount = remainingAmount;
//             over.lockingAmount = party.limit
//             await over.save()
//             if (over.remainingAmount <= 0) {
//                 party.autoBillingStatus = "locked";
//                 await party.save()
//                 body.dueStatus = "overDue"
//                 await overDue(body)
//             } else {
//                 await overDue(body)
//             }
//         }
//     }
//     catch (err) {
//         console.log(err)
//     }
// };

export const UpdateCheckLimit = async (body, limit) => {
    try {
        const over = await PartyOrderLimit.findOne({ partyId: body, activeStatus: "Active" })
        if (over) {
            // const last = over[over.length - 1]
            // console.log(last)
            // const party = await Customer.findById(body)
            over.lockingAmount = limit
            over.remainingAmount = limit - over.totalAmount
            await over.save()
            // if (over.remainingAmount <= 0) {
            //     party.autoBillingStatus = "locked";
            //     // await party.save()
            //     body.dueStatus = "overDue"
            //     // await overDue(body)
            // } else {
            //     // await overDue(body)
            // }
        }
        const existOver = await OverDueReport.findOne({ partyId: body, activeStatus: "Active" })
        if (existOver) {
            existOver.lockingAmount = limit
            // console.log("ovr : " + existOver)
            await existOver.save()
        }
    }
    catch (err) {
        console.log(err)
    }
};

// used
export const checkLimit = async (body) => {
    try {
        const party = await Customer.findById(body.partyId)
        if (party) {
            if (party.remainingLimit > 0) {
                party.remainingLimit = party.remainingLimit - body.grandTotal
                // over.totalAmount = over.totalAmount + body.grandTotal
                // over.remainingAmount = remainingAmount;
                // over.lockingAmount = party.limit
                await party.save()
                if (party.remainingLimit <= 0) {
                    party.autoBillingStatus = "locked";
                    await party.save()
                    body.dueStatus = "overDue"
                    await overDue(body)
                } else {
                    await overDue(body)
                }
            } else {
                const remainingAmount = party.limit - body.grandTotal
                party.remainingLimit = remainingAmount
                await party.save()
                body.totalAmount = body.grandTotal
                body.remainingAmount = remainingAmount;
                body.lockingAmount = party.limit
                if (body.remainingAmount <= 0) {
                    party.autoBillingStatus = "locked";
                    await party.save()
                    body.dueStatus = "overDue"
                    await overDue(body)
                } else {
                    await overDue(body)
                }
            }
        } else {
            console.log("Party Not Found")
        }
    }
    catch (err) {
        console.log(err)
    }
};
export const UpdateCheckLimitSales = async (body) => {
    try {
        const over = await Customer.findById({ _id: body.partyId, status: "Active" })
        if (over) {
            over.remainingLimit += body.grandTotal
            await over.save()
        }
        const existOver = await OverDueReport.findOne({ partyId: body.partyId, activeStatus: "Active" })
        if (existOver) {
            existOver.remainingAmount -= body.grandTotal;
            existOver.totalOrderAmount -= body.grandTotal
            // console.log("ovr : " + existOver)
            await existOver.save()
        }
    }
    catch (err) {
        console.log(err)
    }
};