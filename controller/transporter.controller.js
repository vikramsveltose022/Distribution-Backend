import ExcelJS from 'exceljs'
import { Transporter } from "../model/transporter.model.js";
import { Role } from '../model/role.model.js';


export const SaveTransporter = async (req, res) => {
    try {
        if (req.body.id) {
            const existing = await Transporter.findOne({ status: "Active", database: req.body.database, id: req.body.id })
            if (existing) {
                return res.status(404).json({ message: "id already exist", status: false })
            }
        } else {
            return res.status(400).json({ message: "transporter id required", status: false })
        }
        if (req.file) {
            req.body.image = req.file.filename;
        }
        // req.body.City = JSON.parse(req.body.City)
        if (req.body.serviceArea) {
            req.body.serviceArea = JSON.parse(req.body.serviceArea)
        }
        const transporter = await Transporter.create(req.body)
        return transporter ? res.status(200).json({ message: "transporter save successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error, status: false });
    }
}
export const ViewTransporter = async (req, res, next) => {
    try {
        const database = req.params.database
        let transporter = await Transporter.find({ database: database, status: "Active" }).populate({ path: "rolename", model: "role" }).sort({ sortorder: -1 })
        return transporter ? res.status(200).json({ Transporter: transporter, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const ViewTransposrterById = async (req, res, next) => {
    try {
        let transporter = await Transporter.findById({ _id: req.params.id, status: "Active" }).populate({ path: "rolename", model: "role" })
        return transporter ? res.status(200).json({ Transporter: transporter, status: true }) : res.status(404).json({ error: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false });
    }
}
export const DeleteTransporter = async (req, res, next) => {
    try {
        const transporter = await Transporter.findById({ _id: req.params.id })
        if (!transporter) {
            return res.status(404).json({ error: "Not Found", status: false });
        }
        transporter.status = "Deactive";
        await transporter.save();
        return res.status(200).json({ message: "delete successful", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error", status: false });
    }
}
export const UpdateTransporter = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.filename;
        }
        // req.body.City = JSON.parse(req.body.City)
        const transporterId = req.params.id;
        const existingTransporter = await Transporter.findById(transporterId);
        if (!existingTransporter) {
            return res.status(404).json({ error: 'transporter not found', status: false });
        }
        else {
            if (req.body.serviceArea) {
                req.body.serviceArea = JSON.parse(req.body.serviceArea)
            }
            const updatedTransporter = req.body;
            await Transporter.findByIdAndUpdate(transporterId, updatedTransporter, { new: true });
            return res.status(200).json({ message: 'Transporter Updated Successfully', status: true });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
};

export const saveExcelFile = async (req, res) => {
    try {
        let database = "database"
        let rolename = "rolename";
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
        const existingIds = []
        const dataNotExist = []
        const IdNotExisting = []
        const roles = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                if (heading === 'email' && typeof cellValue === 'object' && 'text' in cellValue) {
                    document[heading] = cellValue.text;
                } else {
                    document[heading] = cellValue;
                }
                // document[heading] = cellValue;
            }
            document[database] = req.params.database
            if (document.database) {
                const role = await Role.findOne({ id: document.rolename, database: document.database })
                if (!role) {
                    roles.push(document.id)
                } else {
                    document[rolename] = role._id.toString()
                    if (document.id) {
                        const existingId = await Transporter.findOne({ id: document.id, database: document.database, status: "Active" });
                        if (existingId) {
                            existingIds.push(document.id)
                        } else {
                            const insertedDocument = await Transporter.create(document);
                            insertedDocuments.push(insertedDocument);
                        }
                    } else {
                        IdNotExisting.push(document.name)
                    }
                }
            } else {
                dataNotExist.push(document.name)
            }
        }
        let message = 'Data Inserted Successfully';
        if (existingIds.length > 0) {
            message = `this transporter already exist: ${existingIds.join(', ')}`;
        } else if (dataNotExist.length > 0) {
            message = `this transporter database not already exist: ${dataNotExist.join(', ')}`;
        } else if (IdNotExisting.length > 0) {
            message = `this transporter id is required : ${IdNotExisting.join(', ')}`;
        } else if (roles.length > 0) {
            message = `this transporter's role id is required : ${roles.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}
export const UpdateExcelTransporter = async (req, res) => {
    try {
        let database = "database"
        let rolename = "rolename";
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
        const IdNotExisting = []
        const roles = [];
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const dataRow = worksheet.getRow(rowIndex);
            const document = {};
            for (let columnIndex = 1; columnIndex <= headings.length; columnIndex++) {
                const heading = headings[columnIndex - 1];
                const cellValue = dataRow.getCell(columnIndex).value;
                document[heading] = cellValue;
            }
            document[database] = req.params.database
            const role = await Role.findOne({ id: document.rolename, database: document.database })
            if (!role) {
                roles.push(document.id)
            } else {
                const existTransporter = await Transporter.findOne({ id: document.id, database: document.database, status: "Active" })
                if (!existTransporter) {
                    IdNotExisting.push(document.id)
                } else {
                    document[rolename] = role._id.toString()
                    const filter = { id: document.id, database: req.params.database }
                    const options = { new: true, upsert: true };
                    const insertedDocument = await Transporter.findOneAndUpdate(filter, document, options);
                    insertedDocuments.push(insertedDocument);
                }
            }
        }
        let message = 'Updated Successfully';
        if (roles.length > 0) {
            message = `this transporter's role id is required: ${roles.join(', ')}`;
        } else if (IdNotExisting.length > 0) {
            message = `this transporter's id not found: ${IdNotExisting.join(', ')}`;
        }
        return res.status(200).json({ message, status: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', status: false });
    }
}