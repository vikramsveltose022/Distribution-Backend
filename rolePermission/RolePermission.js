import { CompanyDetails } from "../model/companyDetails.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { CreditNote } from "../model/creditNote.model.js";
import { Customer } from "../model/customer.model.js";
import { DebitNote } from "../model/debitNote.model.js";
import { GoodDispatch } from "../model/goodDispatch.model.js";
import { Order } from "../model/order.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";
import { PurchaseReturn } from "../model/purchaseReturn.model.js";
import { SalesReturn } from "../model/salesReturn.model.js";
import { TargetCreation } from "../model/targetCreation.model.js";
import { User } from "../model/user.model.js";
import moment from "moment"

export const getCompanyDetailHierarchyBottomToTop = async function getCompanyDetailHierarchyBottomToTop(userId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(userId)) {
            return [];
        }
        processedIds.add(userId);
        const userCompanyDetails = await CompanyDetails.find({
            $or: [{ created_by: userId }, { _id: userId }], database: database
        }).lean();
        const parentUser = await User.findOne({ _id: userId, status: 'Active' }).lean();
        const parentResults = parentUser && parentUser.created_by
            ? await getCompanyDetailHierarchyBottomToTop(parentUser.created_by, database, processedIds)
            : [];
        return userCompanyDetails.concat(parentResults);
    } catch (error) {
        console.error('Error in getCompanyDetailHierarchyBottomToTop:', error);
        throw error;
    }
};

export const getUserHierarchy = async function getUserHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const users = await User.find({ created_by: parentId, database: `${database}`, status: "Active" }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" }).lean();
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getUserHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return users.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getUserHierarchy:', error);
        throw error;
    }
};

// export const getUserHierarchy = async function getUserHierarchy(parentId, database, processedIds = new Set()) {
//     try {
//         if (processedIds.has(parentId)) {
//             return [];
//         }
//         processedIds.add(parentId);
//         let parentUser = null;
//         if (processedIds.size === 1) {
//             parentUser = await User.findOne({ _id: parentId, database: `${database}`, status: "Active" }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" }).populate({ path: "productItems.productId", model: "product" }).lean();
//         }
//         const users = await User.find({ created_by: parentId, database: `${database}`, status: "Active" }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" }).populate({ path: "productItems.productId", model: "product" }).lean();

//         const subUserIds = users.map(user => user._id);
//         const subResultsPromises = subUserIds.map(userId => getUserHierarchy(userId, database, processedIds));
//         const subResults = await Promise.all(subResultsPromises);

//         return [parentUser, ...users.concat(subResults.flat())];
//     } catch (error) {
//         console.error('Error in getUserHierarchy:', error);
//         throw error;
//     }
// };

export const getUserHierarchyDetails = async function getUserHierarchyDetails(parentId, database) {
    try {
        const processedIds = new Set();

        const getUserHierarchy = async function getUserHierarchy(parentId) {
            try {
                if (processedIds.has(parentId)) {
                    return [];
                }
                processedIds.add(parentId);
                const users = await User.find({ created_by: parentId, database: `${database}`, status: "Active" }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" }).populate({ path: "subscriptionPlan", model: "subscription" }).populate({ path: "branch", model: "userBranch" }).populate({ path: "shift", model: "WorkingHour" }).populate({ path: "warehouse.id", model: "warehouse" }).lean();
                const subUserIds = users.map(user => user._id);
                const subResultsPromises = subUserIds.map(userId => getUserHierarchy(userId, database, processedIds));
                const subResults = await Promise.all(subResultsPromises);
                return users.concat(subResults.flat());
            } catch (error) {
                console.error('Error in getUserHierarchy:', error);
                throw error;
            }
        };
        const userHierarchyDetails = await getUserHierarchy(parentId);
        const parentUser = await User.find({ _id: parentId, database: `${database}`, status: "Active" }).populate({ path: "created_by", model: "user" }).populate({ path: "rolename", model: "role" }).populate({ path: "subscriptionPlan", model: "subscription" }).lean();
        const allData = userHierarchyDetails.concat(parentUser)
        return allData.flat();
    } catch (error) {
        console.error('Error in getUserHierarchyDetails:', error);
        throw error;
    }
};

export const getUserHierarchyBottomToTop = async function getUserHierarchyBottomToTop(userId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(userId)) {
            return [];
        }
        processedIds.add(userId);
        const user = await User.findOne({ _id: userId, database: `${database}` }).lean();
        if (!user) {
            return [];
        }
        const createdByUserId = user.created_by;
        if (!createdByUserId) {
            return [user];
        }
        const parentResults = await getUserHierarchyBottomToTop(createdByUserId, database, processedIds);
        return [user, ...parentResults];
    } catch (error) {
        console.error('Error in getUserHierarchyBottomToTop:', error);
        throw error;
    }
};
// -------------------------------------------------------------------------
export const getCustomerHierarchy = async function getCustomerHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            Customer.find({ created_by: parentId, status: 'Active', leadStatusCheck: "false" }).populate({ path: "created_by", model: "user" }).populate({ path: "category", model: "customerGroup" }).populate({ path: "rolename", model: "role" }).populate({ path: "assignTransporter._id", model: "transporter" }).lean()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getCustomerHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};
//-----------------------------------------------------------------------------------
export const getOrderHierarchy = async function getOrderHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            Order.find({ userId: parentId, }).populate({
                path: 'orderItems.productId',
                model: 'product'
            }).populate({ path: "partyId", model: "customer" }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getOrderHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};

export const getSalesReturnHierarchy = async function getSalesReturnHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            SalesReturn.find({ userId: parentId, }).populate({
                path: 'returnItems.productId',
                model: 'product'
            }).populate({
                path: 'orderId',
                model: 'createOrder'
            }).populate({
                path: 'partyId',
                model: 'customer'
            }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getSalesReturnHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};

//----------------------------------------------------------------------

export const getCreateOrderHierarchy = async function getCreateOrderHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            CreateOrder.find({ userId: parentId, status: { $ne: "Deactive" } }).populate({
                path: 'orderItems.productId',
                model: 'product'
            }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" }).populate({ path: "warehouseId", model: "warehouse" }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getCreateOrderHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};

export const getGoodDispatchHierarchy = async function getGoodDispatchHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            GoodDispatch.find({ userId: parentId, }).sort({ sortorder: -1 }).populate({ path: "orderItems.productId", model: "product" }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getGoodDispatchHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};

export const getCreditNoteHierarchy = async function getCreditNoteHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            CreditNote.find({ userId: parentId, }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "partyId", model: "customer" }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getCreditNoteHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};

export const getDebitNoteHierarchy = async function getDebitNoteHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            DebitNote.find({ userId: parentId, }).sort({ sortorder: -1 }).populate({ path: "productItems.productId", model: "product" }).populate({ path: "userId", model: "user" }).populate({ path: "partyId", model: "customer" }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getDebitNoteHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};
//--------------------------------------------------------------------------------
export const getTargetCreationHierarchy = async function getTargetCreationHierarchy(parentId, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, targetCreations] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            TargetCreation.find({ $or: [{ created_by: parentId }, { salesPersonId: parentId }] })
                .populate({ path: 'salesPersonId', model: 'user' })
                .populate({ path: 'products.productId', model: 'product' })
                .lean()
        ]);
        let results = targetCreations;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getTargetCreationHierarchy(userId, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getTargetCreationHierarchy:', error);
        throw error;
    }
};
export const getPurchaseOrderHierarchy = async function getPurchaseOrderHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            PurchaseOrder.find({ userId: parentId, }).sort({ sortorder: -1 }).populate({ path: "orderItems.productId", model: "product" }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getPurchaseOrderHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};

export const getPurchaseReturnHierarchy = async function getPurchaseReturnHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            PurchaseReturn.find({ created_by: parentId, }).populate({
                path: 'returnItems.productId',
                model: 'product'
            }).exec()
        ]);
        let results = customers;
        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getPurchaseReturnHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);
        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};


export const getCustomerHierarchyDeadParty = async function getCustomerHierarchy(parentId, database, processedIds = new Set()) {
    try {
        if (processedIds.has(parentId)) {
            return [];
        }
        processedIds.add(parentId);

        const currentDate = moment();
        const oneMonthAgo = currentDate.clone().subtract(1, 'months').startOf('month');
        const [users, customers] = await Promise.all([
            User.find({ created_by: parentId, status: 'Active' }).lean(),
            Customer.find({ created_by: parentId, status: 'Active', createdAt: { $lt: oneMonthAgo } })
                .populate({ path: "created_by", model: "user" })
                .populate({ path: "Category", model: "customerGroup" })
                .populate({ path: "assignTransporter.id", model: "transporter" })
                .lean()
        ]);

        let results = customers;

        const subUserIds = users.map(user => user._id);
        const subResultsPromises = subUserIds.map(userId => getCustomerHierarchy(userId, database, processedIds));
        const subResults = await Promise.all(subResultsPromises);

        return results.concat(subResults.flat());
    } catch (error) {
        console.error('Error in getCustomerHierarchy:', error);
        throw error;
    }
};
