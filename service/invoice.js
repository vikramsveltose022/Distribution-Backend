import { CompanyDetails } from "../model/companyDetails.model.js";

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