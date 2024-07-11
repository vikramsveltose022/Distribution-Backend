import { CompanyDetails } from "../model/companyDetails.model.js";

export const generateInvoice = async (database) => {
    const companyDetail = await CompanyDetails.findOne({ database: database });
    const invoice = companyDetail.dummy + 1;
    const generatedInvoice = `${companyDetail.Prefix}${invoice}`;
    companyDetail.dummy = invoice;
    await companyDetail.save()

    return generatedInvoice;
};

// export const generateOrderNo = async (database) => {
//     const companyDetail = await CompanyDetails.findOne({ database: database });
//     const invoice = companyDetail.orderNo + 1;
//     invoice.toString().padStart(3, '0')
//     const generatedInvoice = `${"ord"}${invoice}`;
//     companyDetail.dummy = invoice;
//     await companyDetail.save()

//     return generatedInvoice;
// };

// const createCounter = () => {
//     let count = 1;

//     return () => {
//         console.log(count.toString().padStart(3, '0'));
//         count++;
//     };
// };

// const incrementAndPrint = createCounter()