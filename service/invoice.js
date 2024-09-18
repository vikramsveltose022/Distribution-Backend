import { CompanyDetails } from "../model/companyDetails.model.js";
import { DebitNote } from "../model/debitNote.model.js";
import { CreditNote } from "../model/creditNote.model.js";

export const generateInvoice = async (database) => {
    const companyDetail = await CompanyDetails.findOne({ database: database });
    const invoice = companyDetail.dummy + 1;
    const generatedInvoice = `${companyDetail.Prefix}${invoice}`;
    companyDetail.dummy = invoice;
    await companyDetail.save()

    return generatedInvoice;
};

export const generateOrderNo = async (database) => {
    const companyDetail = await CompanyDetails.findOne({ database: database });
    const invoice = companyDetail.orderNo + 1;
    let orderNO = invoice.toString().padStart(3, '0')
    const generatedOrderNo = `${"ORD"}${orderNO}`;
    companyDetail.orderNo = invoice;
    await companyDetail.save()

    return generatedOrderNo;
};

export const warehouseNo = async (database) => {
    const companyDetail = await CompanyDetails.findOne({ database: database });
    const invoice = companyDetail.warehouseDummy + 1;
    let warehouseNo = invoice.toString().padStart(3, '0')
    companyDetail.warehouseDummy = invoice;
    await companyDetail.save()

    return warehouseNo;
};

export const DebitNoteNO = async (body) => {
    const debitNote = await DebitNote.find({ database: body.database, debitType: "D" }).sort({ sortorder: -1 });
    if (debitNote.length === 0) {
        const no = 1
        const DebitNoteNo = `${"DN"}${no}`;
        return DebitNoteNo;
    } else {
        const existNote = debitNote[debitNote.length - 1].NoteNumber
        const lastestNote = existNote.Splice(2)
        let Note = existNote.toString().padStart(3, '0')
        const DebitNoteNo = `${"DN"}${Note}`;
        return DebitNoteNo;
    }
};
export const Credit = async (database) => {
    const companyDetail = await CreditNote.findOne({ database: database, creditType: "C" });
    const invoice = companyDetail.orderNo + 1;
    let orderNO = invoice.toString().padStart(3, '0')
    const generatedOrderNo = `${"ORD"}${orderNO}`;
    companyDetail.orderNo = invoice;
    await companyDetail.save()

    return generatedOrderNo;
};