// import mongoose from 'mongoose';
// import convert from 'xml-js';
// import axios from 'axios';

import mongoose from "mongoose"

// var status = 'status'

// async function createSchema() {
//     const ff = await axios.get('https://xmlfiles.nyc3.digitaloceanspaces.com/CreateUnit.xml');
//     const xmlFile = ff.data;
//     const jsonData = JSON.parse(convert.xml2json(xmlFile, { compact: true, spaces: 2 }));
//     const schemaDefinition = {};
//     schemaDefinition[status] = String
//     if (Array.isArray(jsonData.CreateUnit.input)) {
//         jsonData.CreateUnit.input.forEach((input, index) => {
//             const name = input.name._text;
//             // const type = input.type._text;
//             const type = input.type._attributes.type;
//             if (type === 'text') {
//                 schemaDefinition[name] = String;
//             } else if (type === 'date') {
//                 schemaDefinition[name] = Date;
//             } else if (type === 'number') {
//                 schemaDefinition[name] = Number;
//             } else {
//                 schemaDefinition[name] = String;
//             }
//         });
//     } else {
//         const input = jsonData.CreateUnit.input;
//         const name = input.name._text;
//         // const type = input.type._text;
//         const type = input.type._attributes.type;
//         if (type === 'text') {
//             schemaDefinition[name] = String;
//         } else if (type === 'date') {
//             schemaDefinition[name] = Date;
//         } else if (type === 'number') {
//             schemaDefinition[name] = Number;
//         } else {
//             schemaDefinition[name] = String;
//         }
//     }
//     if (jsonData.CreateUnit.MyDropdown) {
//         if (Array.isArray(jsonData.CreateUnit.MyDropdown)) {
//             jsonData.CreateUnit.MyDropdown.forEach((dropdown) => {
//                 if (Array.isArray(dropdown.dropdown)) {
//                     dropdown.dropdown.forEach((item) => {
//                         const name = item.name._text;
//                         schemaDefinition[name] = String;
//                     });
//                 } else {
//                     const item = dropdown.dropdown;
//                     const name = item.name._text;
//                     schemaDefinition[name] = String;
//                 }
//             });
//         } else {
//             if (Array.isArray(jsonData.CreateUnit.MyDropdown.dropdown)) {
//                 jsonData.CreateUnit.MyDropdown.dropdown.forEach((item) => {
//                     const name = item.name._text;
//                     schemaDefinition[name] = String;
//                 });
//             } else {
//                 const item = jsonData.CreateUnit.MyDropdown.dropdown;
//                 const name = item.name._text;
//                 schemaDefinition[name] = String;
//             }
//         }
//     }
//     if (jsonData.CreateUnit.CheckBox) {
//         if (Array.isArray(jsonData.CreateUnit.CheckBox.input)) {
//             jsonData.CreateUnit.CheckBox.input.forEach((input, index) => {
//                 const check = input.name._text;
//                 // const type = input.type._text
//                 const type = input.type._attributes.type;
//                 if (type === 'Boolean') {
//                     schemaDefinition[check] = Boolean;
//                 }
//                 else {
//                     schemaDefinition[check] = String
//                 }
//             });
//         } else {
//             const input = jsonData.CreateUnit.CheckBox.input;
//             const check = input.name._text;
//             // const type = input.type._text;
//             const type = input.type._attributes.type;
//             if (type === 'Boolean') {
//                 schemaDefinition[check] = Boolean;
//             }
//             else {
//                 schemaDefinition[check] = String
//             }
//         }
//     }

//     if (jsonData.CreateUnit.Radiobutton) {
//         if (Array.isArray(jsonData.CreateUnit.Radiobutton.input)) {
//             jsonData.CreateUnit.Radiobutton.input.forEach((input, index) => {
//                 const check = input.name._text;
//                 const type = input.type._text
//                 schemaDefinition[check] = String
//             });
//         } else {
//             const input = jsonData.CreateUnit.Radiobutton.input;
//             const check = input.name._text;
//             schemaDefinition[check] = String
//         }
//     }
//     return new mongoose.Schema(schemaDefinition, { timestamps: true });
// }

// export const UnitSchema = await createSchema();
// export const Unit = mongoose.model('unit', UnitSchema);

const UnitSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    database: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    primaryUnit: {
        type: String
    },
    secondaryUnit: {
        type: String
    },
    unitQty: {
        type: Number
    },
    box: {
        type: String
    }
}, { timestamps: true })

export const Unit = mongoose.model("unit", UnitSchema)