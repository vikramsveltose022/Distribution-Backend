import { CompanyDetails } from "../model/companyDetails.model.js";
import { Customer } from "../model/customer.model.js";
import { GstDetails } from "../model/gstcalculate.model.js";
import { Product } from "../model/product.model.js";


export const GstCalculate = async function gstCalculate(body) {
    try {
        const user = await CompanyDetails.findOne({ database: body.database }).sort({ sortorder: -1 });
        const adminGst = await user.gstNo.slice(0, 2);
        const customer = await Customer.findById({ _id: body.partyId });
        const partyGst = await customer.gstNumber.slice(0, 2);
        const gstDetails = [];
        await Promise.all(body.orderItems.map(async (item, index) => {
            const product = await Product.findById(item.productId);
            const rate = product.GSTRate / 2;
            let gstDetail = {
                hsn: product.HSN_Code,
                taxable: item.price,
            };
            if (adminGst === partyGst) {
                console.log("CGST & SGST");
                const cgst = (item.price * rate) / 100;
                gstDetail.centralTax = [{
                    rate: rate,
                    amount: cgst,
                }];
                gstDetail.stateTax = [{
                    rate: rate,
                    amount: cgst,
                }];
            } else {
                const igst = (item.price * rate) / 100;
                gstDetail.igstTax = [{
                    rate: rate,
                    amount: igst,
                }];
            }
            gstDetails.push(gstDetail);
        }));
        const gst = {
            database: body.database,
            partyId: body.partyId,
            userId: body.userId,
            orderId: body.orderId,
            gstDetails: gstDetails,
        };
        // console.log(gst); // Output the final GST object
        await GstDetails.create(gst)
        return gst;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};

export const GstCalculateStock = async function gstCalculate(body) {
    try {
        const gstDetails = [];
        let grandTotal = 0;
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;
        for (let item of body) {
            const rate = item.gstPercentage / 2;
            const productId = item.productId;
            const HSN_Code = item.productId.HSN_Code;
            const Product_Desc = item.productId.Product_Desc;
            if (item.igstTaxType === false) {
                cgstRate = ((item.currentStock * item.price) * rate) / 100;
                sgstRate = ((item.currentStock * item.price) * rate) / 100;
                grandTotal = (item.currentStock * item.price) + (cgstRate + sgstRate)
            } else {
                igstRate = ((item.currentStock * item.price) * item.gstPercentage) / 100;
                grandTotal = (item.currentStock * item.price) + igstRate
            }
            const gst = {
                HSN_Code: HSN_Code,
                Product_Desc: Product_Desc,
                unitType: item.unitType,
                qty: item.currentStock,
                grandTotal: grandTotal,
                gstPercentage: item.gstPercentage,
                taxableAmount: (item.currentStock * item.price),
                igstRate: igstRate,
                cgstRate: cgstRate,
                sgstRate: sgstRate
            };
            gstDetails.push(gst);
        }
        return gstDetails;
    } catch (error) {
        console.error('Internal Server Error:', error);
        throw error;
    }
};