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
                debitBalance: total1,
                creditBalance: dd,
                dummyCreditBalance: dd,
                closingBalance: totalBalance,
                ledgerType: "user"
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
            debitBalance: body.grandTotal,
            creditBalance: 0,
            dummyCreditBalance: 0,
            closingBalance: body.grandTotal,
            ledgerType: "user"
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
        const ledger = await Ledger.find({ partyId: body.partyId, ledgerType: "party" }).sort({ sortorder: -1 })
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
                dd = first.debitBalance
            }
            else {
                totalBalance = first.closingBalance - credit
                dd = 0;
            }
            const saveData = {
                database: body.database,
                partyId: body.partyId,
                partyId1: body.partyId1,
                // userId: body.SuperAdmin || body.userId,
                // name: party.firstName + " " + party.lastname,
                reason: body.invoiceId || body.type,
                particular: part,
                voucherNo: first.voucherNo + 1,
                voucherType: part,
                credit: credit,
                creditBalance: total1,
                debitBalance: dd,
                dummyDebitBalance: dd,
                closingBalance: totalBalance,
                ledgerType: "party"
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            partyId: body.partyId,
            partyId1: body.partyId1,
            // userId: body.SuperAdmin || body.userId,
            // name: party.firstName + " " + party.lastName,
            reason: body.invoiceId || body.type,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            creditBalance: credit,
            debitBalance: 0,
            dummyDebitBalance: 0,
            closingBalance: totalBalance - credit,
            ledgerType: "party"
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
        const party = await Customer.findById(body.partyId)
        const debit = body.grandTotal || body.amount;
        const ledger = await Ledger.find({ partyId: body.partyId, ledgerType: "party" }).sort({ sortorder: -1 })
        let totalBalance = 0;
        let dd = 0;
        if (ledger.length > 0) {
            const first = await ledger[ledger.length - 1]
            const total1 = first.debitBalance + debit
            if (first.creditBalance) {
                totalBalance = first.closingBalance + debit
                dd = first.creditBalance
            }
            else {
                totalBalance = first.closingBalance + debit
                dd = 0;
            }
            const saveData = {
                database: body.database,
                // userId: body.SuperAdmin || body.userId,
                partyId: body.partyId,
                partyId1: body.partyId1,
                // name: party.firstName + " " + party.lastName,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                debit: debit,
                debitBalance: total1,
                creditBalance: dd,
                dummyCreditBalance: dd,
                closingBalance: totalBalance,
                ledgerType: "party"
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            // userId: body.SuperAdmin || body.userId,
            partyId: body.partyId,
            partyId1: body.partyId1,
            // name: party.firstName + " " + party.lastName,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            debit: debit,
            debitBalance: debit,
            creditBalance: 0,
            dummyCreditBalance: 0,
            closingBalance: debit,
            ledgerType: "party"
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
                // name: party.firstName + " " + party.lastName,
                reason: body.type || body.invoiceId,
                particular: part,
                voucherType: part,
                voucherNo: first.voucherNo + 1,
                credit: credit,
                creditBalance: total1,
                debitBalance: dd,
                dummyDebitBalance: dd,
                closingBalance: totalBalance,
                ledgerType: "user"
            }
            const led = await Ledger.create(saveData)
            return led;
        }
        const saveData = {
            database: body.database,
            partyId: body.partyId,
            userId: body.SuperAdmin || body.userId,
            // name: party.firstName + " " + party.lastName,
            reason: body.type || body.invoiceId,
            particular: part,
            voucherType: part,
            voucherNo: 1,
            credit: credit,
            creditBalance: credit,
            debitBalance: 0,
            dummyDebitBalance: 0,
            closingBalance: totalBalance - credit,
            ledgerType: "user"
        }
        const led = await Ledger.create(saveData)
        return led;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};
