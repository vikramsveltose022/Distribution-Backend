import ExcelJS from "exceljs"
import axios from "axios";
import { Product } from "../model/product.model.js";
import { Warehouse } from "../model/warehouse.model.js";
import { Unit } from "../model/unit.model.js";
import { CreateOrder } from "../model/createOrder.model.js";
import { PurchaseOrder } from "../model/purchaseOrder.model.js";

export const ProductXml = async (req, res) => {
  const fileUrl = "https://xmlfiles.nyc3.digitaloceanspaces.com/conProduct.xml";
  try {
    const response = await axios.get(fileUrl);
    const data = response.data;
    return res.status(200).json({ data, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error reading the file");
  }
};
export const SaveProduct = async (req, res) => {
  try {
    //   if (req.body.id) {
    //     const existing = await Product.findOne({ id: req.body.id })
    //     if (existing) {
    //         return res.status(404).json({ message: "id already exist", status: false })
    //     }
    // } else {
    //     return res.status(400).json({ message: "id required", status: false })
    // }
    // if (req.file) {
    //   req.body.Product_image = req.file.filename;
    // }
    if (req.files) {
      let images = [];
      req.files.map((file) => {
        images.push(file.filename);
      });
      // req.body.thumbnail = thumb;
      req.body.Product_image = images;
    }
    const product = await Product.create(req.body);
    await addProductInWarehouse1(req.body, product.warehouse, product)
    return product ? res.status(200).json({ message: "product save successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const ViewProduct = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const database = req.params.database;
    // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
    // if (!adminDetail.length > 0) {
    //   return res.status(404).json({ error: "Product Not Found", status: false })
    // }
    const product = await Product.find({ database: database, status: 'Active', purchaseStatus: true }).sort({ sortorder: -1 }).populate({ path: "warehouse", model: "warehouse" });
    return res.status(200).json({ Product: product, status: true })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const ViewProductForPurchase = async (req, res, next) => {
  try {
    const database = req.params.database;
    const product = await Product.find({ database: database, status: 'Active' }).sort({ sortorder: -1 }).populate({ path: "warehouse", model: "warehouse" });
    return res.status(200).json({ Product: product, status: true })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const ViewProductById = async (req, res, next) => {
  try {
    let product = await Product.findById({ _id: req.params.id }).sort({
      sortorder: -1,
    })
    return product ? res.status(200).json({ Product: product, status: true }) : res.status(404).json({ error: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const DeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: "Not Found", status: false });
    }
    product.status = "Deactive";
    await product.save();
    return res.status(200).json({ message: "delete successful", status: true })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error", status: false });
  }
};
export const UpdateProduct = async (req, res, next) => {
  try {
    // if (req.file) {
    //   req.body.Product_image = req.file.filename;
    // }
    if (req.files) {
      let images = [];
      req.files.map((file) => {
        images.push(file.filename);
      });
      // req.body.thumbnail = thumb;
      req.body.Product_image = images;
    }
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "product not found", status: false });
    } else {
      const updatedProduct = req.body;
      const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });
      // if (req.body.warehouse) {
      //   const warehouse = { productId: product._id, unitType: product.unitType, currentStock: product.qty, transferQty: product.qty, price: product.Product_MRP, totalPrice: (product.Product_MRP * product.qty), Size: req.body.unitQty }
      //   await addProductInWarehouse(warehouse, req.body.warehouse)
      // }
      return res.status(200).json({ message: "Product Updated Successfully", status: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const StockAlert = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ database: req.params.database });
    let alertProducts = [];
    for (let warehouse of warehouses) {
      const productItems = warehouse.productItems;
      if (!productItems || productItems.length === 0) {
        continue;
      }
      const productIdsInWarehouse = productItems.map(product => product.productId);
      if (!productIdsInWarehouse || productIdsInWarehouse.length === 0) {
        continue;
      }
      const products = await Product.find({ _id: { $in: productIdsInWarehouse } }).populate({ path: "partyId", model: "customer" });
      if (!products || products.length === 0) {
        continue;
      }
      const warehouseAlertProducts = productItems
        .filter(item => {
          const product = products.find(p => p._id.toString() === item.productId.toString());
          return product && item.currentStock < product.MIN_stockalert;
        })
        .map(item => {
          const product = products.find(p => p._id.toString() === item.productId.toString());
          return {
            productId: item.productId,
            HSN_Code: product.HSN_Code,
            Product_Title: product.Product_Title,
            Product_image: product.Product_image,
            Product_Desc: product.Product_Desc,
            Product_MRP: product.Product_MRP,
            GSTRate: product.GSTRate,
            Size: item.Size,
            taxableAmount: (item.currentStock * product.Product_MRP),
            Total: ((item.currentStock * product.Product_MRP) * (100 + parseInt(product.GSTRate))) / 100,
            currentStock: item.currentStock,
            MIN_stockalert: product.MIN_stockalert,
            warehouseName: warehouse.warehouseName,
            warehosueAddress: warehouse.address,
            SupplierName: product?.partyId?.ownerName || null,
            SupplierGST: product?.partyId?.gstNumber || null
          };
        });

      alertProducts = [...alertProducts, ...warehouseAlertProducts];
    }

    return res.status(200).json({ alertProducts, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const viewCurrentStock = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "warehouse not found", status: false });
    }
    const productItem = warehouse.productItems.find(item => item.productId === req.params.productId);
    if (!productItem) {
      return res.status(404).json({ message: "Product not found in the warehouse", status: false });
    }
    return res.status(200).json({ currentStock: productItem, status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const saveItemWithExcel = async (req, res) => {
  try {
    const filePath = await req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const headerRow = worksheet.getRow(1);
    const headings = [];
    headerRow.eachCell((cell) => {
      headings.push(cell.value);
    });
    const insertedDocuments = [];
    const existingParts = [];
    for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
      const dataRow = worksheet.getRow(rowIndex);
      const document = {};
      for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
        const heading = headings[columnIndex - 1];
        const cellValue = dataRow.getCell(columnIndex).value;
        document[heading] = cellValue;
      }
      if (document.HSN_Code) {
        const insertedDocument = await Product.create(document);
        await addProductInWarehouse1(document, insertedDocument.warehouse, insertedDocument)
        insertedDocuments.push(insertedDocument);
      } else {
        existingParts.push(document.Product_Title)
      }
    }
    let message = 'Data Inserted Successfully';
    if (existingParts.length > 0) {
      message = `Some product not exist hsn code: ${existingParts.join(', ')}`;
    }
    return res.status(200).json({ message, status: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', status: false });
  }
}
export const updateItemWithExcel = async (req, res) => {
  try {
    const filePath = await req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const headerRow = worksheet.getRow(1);
    const headings = [];
    headerRow.eachCell((cell) => {
      headings.push(cell.value);
    });
    const insertedDocuments = [];
    const existingParts = [];
    for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
      const dataRow = worksheet.getRow(rowIndex);
      const document = {};
      for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
        const heading = headings[columnIndex - 1];
        const cellValue = dataRow.getCell(columnIndex).value;
        document[heading] = cellValue;
      }
      // if (document.HSN_Code) {
      const filter = { Product_Title: document.Product_Title, database: req.params.database }; // Ensure the filter is correctly formed
      const options = { new: true, upsert: true }; // Consider using upsert if you want to create the document if it doesn't exist
      const insertedDocument = await Product.findOneAndUpdate(filter, document, options);

      // await addProductInWarehouse1(document, insertedDocument.warehouse,insertedDocument)
      insertedDocuments.push(insertedDocument);
      // } else {
      //   existingParts.push(document.Product_Title)
      // }
    }
    let message = 'Updated Successfull !';
    if (existingParts.length > 0) {
      message = `Some product not exist hsn code: ${existingParts.join(', ')}`;
    }
    return res.status(200).json({ message, status: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', status: false });
  }
}

export const addProductInWarehouse1 = async (warehouse, warehouseId, id) => {
  try {
    const user = await Warehouse.findById({ _id: warehouseId })
    if (!user) {
      return console.log("warehouse not found")
    }
    const sourceProductItem = user.productItems.find(
      (pItem) => pItem.productId === id.productId);
    if (sourceProductItem) {
      // sourceProductItem.Size += warehouse.Size;
      sourceProductItem.currentStock += warehouse.Opening_Stock
      sourceProductItem.totalPrice += warehouse.Purchase_Rate;
      sourceProductItem.transferQty += warehouse.Opening_Stock;
      user.markModified('productItems');
      await user.save();
    } else {
      let ware = {
        productId: id._id,
        // Size: warehouse.Size,
        // unitType: warehouse.unitType,
        primaryUnit: warehouse.primaryUnit,
        secondaryUnit: warehouse.secondaryUnit,
        secondarySize: warehouse.secondarySize,
        currentStock: warehouse.Opening_Stock,
        transferQty: warehouse.Opening_Stock,
        price: warehouse.price,
        totalPrice: warehouse.Purchase_Rate,
        gstPercentage: warehouse.gstPercentage,
        igstType: warehouse.igstType
      }
      const updated = await Warehouse.updateOne({ _id: warehouseId },
        {
          $push: { productItems: ware },
        },
        { upsert: true });
    }
  } catch (error) {
    console.error(error);
  }
};
export const addProductInWarehouse = async (warehouse, warehouseId) => {
  try {
    const user = await Warehouse.findById({ _id: warehouseId })
    if (!user) {
      return console.log("warehouse not found")
    }
    const sourceProductItem = user.productItems.find(
      (pItem) => pItem.productId.toString() === warehouse.productId._id.toString());
    if (sourceProductItem) {
      // sourceProductItem.Size += warehouse.Size;
      sourceProductItem.currentStock += warehouse.transferQty
      sourceProductItem.totalPrice += warehouse.totalPrice;
      sourceProductItem.transferQty += warehouse.transferQty;
      user.markModified('productItems');
      await user.save();
    } else {
      await Warehouse.updateOne({ _id: warehouseId },
        {
          $push: { productItems: warehouse },
        },
        { upsert: true });
    }
  } catch (error) {
    console.error(error);
  }
};

// HSN SALES SUMMARY REPORT
export const HSNWiseSalesReport = async (req, res, next) => {
  try {
    const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
    const targetQuery = { database: req.params.database };
    if (startDate && endDate) {
      targetQuery.createdAt = { $gte: startDate, $lte: endDate };
    }
    let orders = [];
    const salesOrder = await CreateOrder.find(targetQuery).populate({ path: "orderItems.productId", model: "product" });
    if (salesOrder.length === 0) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    for (let order of salesOrder) {
      orders = orders.concat(order.orderItems);
    }
    const uniqueOrdersMap = new Map();
    for (let orderItem of orders) {
      const key = orderItem.productId.HSN_Code;
      if (uniqueOrdersMap.has(key)) {
        const existingOrder = uniqueOrdersMap.get(key);
        existingOrder.taxableAmount += orderItem.taxableAmount;
        existingOrder.cgstRate += orderItem.cgstRate;
        existingOrder.qty += orderItem.qty;
        existingOrder.sgstRate += orderItem.sgstRate;
        existingOrder.igstRate += orderItem.igstRate;
        existingOrder.grandTotal += orderItem.grandTotal;
        existingOrder.gstPercentage = orderItem.gstPercentage;
      } else {
        const newOrder = {
          // productId: orderItem.productId,
          HSN_Code: orderItem.productId.HSN_Code,
          Product_Desc: orderItem.productId.Product_Desc,
          unitType: orderItem.unitType,
          qty: orderItem.qty * orderItem.Size,
          grandTotal: orderItem.grandTotal,
          gstPercentage: orderItem.gstPercentage,
          taxableAmount: orderItem.taxableAmount,
          igstRate: orderItem.igstRate,
          cgstRate: orderItem.cgstRate,
          sgstRate: orderItem.sgstRate,
        };
        uniqueOrdersMap.set(key, newOrder);
      }
    }
    const uniqueOrders = Array.from(uniqueOrdersMap.values());
    return res.status(200).json({ HSNSales: uniqueOrders, status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const HSNWisePurchaseReport = async (req, res, next) => {
  try {
    const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
    const targetQuery = { database: req.params.database };
    if (startDate && endDate) {
      targetQuery.createdAt = { $gte: startDate, $lte: endDate };
    }
    let orders = [];
    const salesOrder = await PurchaseOrder.find(targetQuery).populate({ path: "orderItems.productId", model: "product" });
    if (salesOrder.length === 0) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    for (let order of salesOrder) {
      orders = orders.concat(order.orderItems);
    }
    const uniqueOrdersMap = new Map();
    for (let orderItem of orders) {
      const key = orderItem.productId.HSN_Code;
      if (uniqueOrdersMap.has(key)) {
        const existingOrder = uniqueOrdersMap.get(key);
        existingOrder.taxableAmount += orderItem?.taxableAmount || 0;
        existingOrder.cgstRate += orderItem.cgstRate;
        existingOrder.qty += orderItem.qty;
        existingOrder.sgstRate += orderItem.sgstRate;
        existingOrder.igstRate += orderItem.igstRate;
        existingOrder.grandTotal += orderItem.grandTotal;
        existingOrder.gstPercentage = orderItem.gstPercentage;
      } else {
        const newOrder = {
          // productId: orderItem.productId,
          HSN_Code: orderItem.productId.HSN_Code,
          Product_Desc: orderItem.productId.Product_Desc,
          unitType: orderItem.unitType,
          qty: orderItem.qty * orderItem.Size,
          grandTotal: orderItem.grandTotal,
          gstPercentage: orderItem.gstPercentage,
          taxableAmount: orderItem.taxableAmount,
          igstRate: orderItem.igstRate,
          cgstRate: orderItem.cgstRate,
          sgstRate: orderItem.sgstRate,
        };
        uniqueOrdersMap.set(key, newOrder);
      }
    }
    const uniqueOrders = Array.from(uniqueOrdersMap.values());
    return res.status(200).json({ HSNPurchase: uniqueOrders, status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
