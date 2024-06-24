import { Production } from "../model/production.model.js";
import { User } from "../model/user.model.js";
import { getUserHierarchyBottomToTop } from "../rolePermission/RolePermission.js";


export const CreateProduction = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.body.created_by })
        if (!user) {
            return res.status(400).json({ message: "User Not Found", status: false })
        }
        req.body.database = user.database;
        const process = await Production.create(req.body);
        return process ? res.status(200).json({ Production: process, message: "Production Creation successful", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const viewProductionDetails = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const database = req.params.database;
        const adminDetail = await getUserHierarchyBottomToTop(userId, database)
        if (!adminDetail.length > 0) {
            return res.status(404).json({ error: "Production Not Found", status: false })
        }
        const process = await Production.find({}).sort({ sortorder: -1 }).populate({ path: "product_name", model: "product" }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "wastageItems.productId", model: "product" }).populate({ path: "returnItems.productId", model: "product" })
        return res.status(200).json({ Production: process, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
};
export const ViewProductionById = async (req, res, next) => {
    try {
        let production = await Production.findById({ _id: req.params.id }).sort({
            sortorder: -1,
        }).populate({ path: "product_name", model: "product" }).populate({ path: "productItems.productId", model: "product" })
        return production ? res.status(200).json({ Production: production, status: true }) : res.status(404).json({ error: "Not Found", status: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
};

export const updateReturnProduction = async (req, res) => {
    try {
        const { returnItems, returnAmount } = req.body;
        const existingData = await Production.findOne({ product_name: req.params.id });
        if (!existingData) {
            return res.status(404).json({ message: "Production data not found", status: false });
        }
        const returnProduction = await Production.findOneAndUpdate(
            { product_name: req.params.id },
            {
                $push: { returnItems: { $each: returnItems } },
                $inc: { returnAmount: returnAmount },
            }, { new: true, upsert: true });
        return returnProduction
            ? res.status(200).json({ message: "Production data updated successfully", status: true, data: returnProduction })
            : res.status(500).json({ message: "Something went wrong during the update", status: false });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateCreateProduction = async (req, res) => {
    try {
        const id = req.params.id;
        const { product_name, productItems } = req.body;
        const existingData = await Production.findOne({ _id: id });
        if (existingData) {
            let productsUpdated = false;
            for (const item of productItems) {
                const destinationProduct = await Production.findOne({
                    _id: id,
                    'productItems.productId': item.productId,
                });
                if (destinationProduct) {
                    const destinationProductItem = destinationProduct.productItems.find(
                        (pItem) => pItem.productId.toString() === item.productId
                    );
                    destinationProductItem.qty = item.qty || destinationProductItem.qty;
                    destinationProductItem.totalPrice = item.totalPrice || destinationProductItem.totalPrice;
                    destinationProduct.grandTotal = req.body.grandTotal || destinationProduct.grandTotal;
                    destinationProduct.product_name = product_name || destinationProduct.product_name
                    destinationProduct.miscellaneousExpennses = req.body.miscellaneousExpennses || destinationProduct.miscellaneousExpennses
                    destinationProduct.gstApplied = req.body.gstApplied || destinationProduct.gstApplied;
                    destinationProduct.discount = req.body.discount || destinationProduct.discount;
                    destinationProduct.otherCharges = req.body.otherCharges || destinationProduct.otherCharges
                    await destinationProduct.save();
                    productsUpdated = true;
                } else {
                    await Production.updateOne(
                        { _id: id },
                        {
                            $push: { productItems: item },
                            $set: {
                                grandTotal: req.body.grandTotal,
                                miscellaneousExpennses: req.body.miscellaneousExpennses,
                                gstApplied: req.body.gstApplied,
                                discount: req.body.discount,
                                otherCharges: req.body.otherCharges,
                            },
                        },
                        { upsert: true }
                    );
                }
            }
            if (productsUpdated) {
                return res.json({ message: 'Products updated successfully', status: true });
            } else {
                return res.json({ message: 'No products updated', status: true });
            }
        } else {
            return res.status(400).json({ message: 'not found', status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};
