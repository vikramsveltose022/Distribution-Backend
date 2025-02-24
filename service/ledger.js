import { CreateOrder } from "../model/createOrder.model.js";
import { Customer } from "../model/customer.model.js";
import { Ledger } from "../model/ledger.model.js";

export const ledgerSalesForDebit = async function ledger(body, particular) {
    try {
        const part = particular;
        const debit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ userId: body.userId, ledgerType: "user" }).sort({ sortorder: -1 })
        let totalBalance = 0;
        let dd = 0;
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const total1 = first.debitBalance + debit
            if (first.creditBalance) {
                totalBalance = first.closingBalance + debit;
                dd = first.creditBalance
            }
            else {
                totalBalance = first.closingBalance + debit
                dd = 0;
            }
            const saveData = {
                database: body.database,
                userId: body.SuperAdmin || body.userId,
                partyId: body.partyId,
                name: body.fullName,
                reason: body.invoiceId || body.type,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                debit: debit,
                ledgerType: "user",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            userId: body.SuperAdmin || body.userId,
            partyId: body.partyId,
            name: body.fullName,
            reason: body.invoiceId || body.type,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            debit: debit,
            ledgerType: "user",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerPartyForCredit = async function ledger(body, particular) {
    try {
        const part = particular
        const credit = body.grandTotal || body.amount;
        const party = await Customer.findById(body.partyId)
        if (party && party.paymentTerm.toLowerCase() !== "cash") {
            // await PartyPayment(body)
            // party.remainingLimit += credit
            if (party.remainingLimit > party.limit) {
                let advance = (party.remainingLimit+credit) - party.limit;
                // party.limit += advance
                party.AdvanceAmount += advance
            }
            await party.save()
        }
        const ledger = await Ledger.find({ partyId: body.partyId, ledgerType: "party" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                partyId: body.partyId,
                orderId: body._id.toString(),
                reason: body.invoiceId || body.type,
                particular: part,
                voucherNo: first.voucherNo + 1,
                voucherType: part,
                credit: credit,
                ledgerType: "party",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            partyId: body.partyId,
            orderId: body._id.toString(),
            reason: body.invoiceId || body.type,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            ledgerType: "party",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerPartyForDebit = async function ledger(body, particular) {
    try {
        const part = particular
        const debit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ partyId: body.partyId, ledgerType: "party" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                partyId: body.partyId,
                orderId: body._id,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                debit: debit,
                ledgerType: "party",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            partyId: body.partyId,
            orderId: body._id,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            debit: debit,
            ledgerType: "party",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerSalesForCredit = async function ledger(body, particular) {
    try {
        const part = particular
        const credit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ userId: body.userId, ledgerType: "user" }).sort({ sortorder: -1 })
        let totalBalance = 0;
        let total1 = 0;
        let dd = 0;
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            if (first.creditBalance) {
                total1 = first.creditBalance + credit
            }
            else {
                total1 = credit
            }
            if (first.debitBalance) {
                totalBalance = first.closingBalance - credit
                dd = first.debitBalance;
            }
            else {
                totalBalance = first.closingBalance - credit
                dd = 0;
            }
            const saveData = {
                database: body.database,
                partyId: body.partyId,
                userId: body.SuperAdmin || body.userId,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                credit: credit,
                ledgerType: "user",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            partyId: body.partyId,
            userId: body.SuperAdmin || body.userId,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            ledgerType: "user",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};

export const ledgerUserForCredit = async function ledger(body, particular) {
    try {
        const part = particular
        const credit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ userId: body.userId, ledgerType: "user" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                userId: body.userId,
                orderId: body._id.toString(),
                reason: body.invoiceId || body.type,
                particular: part,
                voucherNo: first.voucherNo + 1,
                voucherType: part,
                credit: credit,
                ledgerType: "user",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            userId: body.userId,
            orderId: body._id.toString(),
            reason: body.invoiceId || body.type,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            ledgerType: "user",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerUserForDebit = async function ledger(body, particular) {
    try {
        const part = particular
        const debit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ userId: body.userId, ledgerType: "user" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                orderId: body._id.toString(),
                userId: body.userId,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                debit: debit,
                ledgerType: "user",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            orderId: body._id.toString(),
            userId: body.userId,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            debit: debit,
            ledgerType: "user",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerExpensesForCredit = async function ledger(body, particular) {
    try {
        const part = particular
        const credit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ expenseId: body.expenseId, ledgerType: "expenses" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                expenseId: body.expenseId,
                orderId: body._id.toString(),
                reason: body.invoiceId || body.type,
                particular: part,
                voucherNo: first.voucherNo + 1,
                voucherType: part,
                credit: credit,
                ledgerType: "expenses",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            expenseId: body.expenseId,
            orderId: body._id.toString(),
            reason: body.invoiceId || body.type,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            ledgerType: "expenses",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerExpensesForDebit = async function ledger(body, particular) {
    try {
        const part = particular
        const debit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ expenseId: body.expenseId, ledgerType: "expenses" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                orderId: body._id.toString(),
                expenseId: body.expenseId,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                debit: debit,
                ledgerType: "expenses",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            orderId: body._id.toString(),
            expenseId: body.expenseId,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            debit: debit,
            ledgerType: "expenses",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};

export const ledgerTransporterForCredit = async function ledger(body, particular) {
    try {
        const part = particular
        const credit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ transporterId: body.transporterId, ledgerType: "transporter" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                transporterId: body.transporterId,
                orderId: body._id.toString(),
                reason: body.invoiceId || body.type,
                particular: part,
                voucherNo: first.voucherNo + 1,
                voucherType: part,
                credit: credit,
                ledgerType: "transporter",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            transporterId: body.transporterId,
            orderId: body._id.toString(),
            reason: body.invoiceId || body.type,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            ledgerType: "transporter",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const ledgerTransporterForDebit = async function ledger(body, particular) {
    try {
        const part = particular
        const debit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ transporterId: body.transporterId, ledgerType: "transporter" }).sort({ sortorder: -1 })
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const saveData = {
                database: body.database,
                orderId: body._id.toString(),
                transporterId: body.transporterId,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                debit: debit,
                ledgerType: "transporter",
                date: body.date
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            orderId: body._id.toString(),
            transporterId: body.transporterId,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            debit: debit,
            ledgerType: "transporter",
            date: body.date
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
export const PartyPayment = async (body) => {
    try {
        let amount = body.grandTotal || body.amount
        const Orders = await CreateOrder.find({ partyId: body.partyId, paymentStatus: false }).sort({ date: 1, sortorder: -1 })
        const customer = await Customer.findById(body.partyId)
        if (Orders.length === 0) {
            console.log("Order's Not Found")
        } else {
            for (let item of Orders) {
                const remaining = ((amount + customer.dummyAmount) - item.grandTotal);
                customer.dummyAmount = 0
                if (remaining < 0) {
                    customer.dummyAmount = amount
                    await customer.save()
                    break
                } else {
                    amount = remaining
                    item.paymentStatus = true;
                    await item.save()
                    await customer.save()
                }
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}