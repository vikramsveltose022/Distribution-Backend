import mongoose from 'mongoose';
import convert from 'xml-js';
import axios from 'axios';

var status = 'status';
let rolename = 'rolename';
let created_by = 'created_by';

async function createSchema() {
    const ff = await axios.get('https://xmlfiles.nyc3.digitaloceanspaces.com/PartyCreation.xml');
    const xmlFile = ff.data;
    const jsonData = JSON.parse(convert.xml2json(xmlFile, { compact: true, spaces: 2 }));
    const schemaDefinition = {};
    schemaDefinition[rolename] = String;
    schemaDefinition[created_by] = String;
    schemaDefinition[status] = String
    if (Array.isArray(jsonData.CreateParty.input)) {
        jsonData.CreateParty.input.forEach((input, index) => {
            const name = input.name._text;
            // const type = input.type._text;
            const type = input.type._attributes.type;
            if (type === 'text') {
                schemaDefinition[name] = String;
            } else if (type === 'date') {
                schemaDefinition[name] = Date;
            } else if (type === 'number') {
                schemaDefinition[name] = Number;
            } else {
                schemaDefinition[name] = String;
            }
        });
    } else {
        const input = jsonData.CreateParty.input;
        const name = input.name._text;
        // const type = input.type._text;
        const type = input.type._attributes.type;
        if (type === 'text') {
            schemaDefinition[name] = String;
        } else if (type === 'date') {
            schemaDefinition[name] = Date;
        } else if (type === 'number') {
            schemaDefinition[name] = Number;
        } else {
            schemaDefinition[name] = String;
        }
    }
    if (jsonData.CreateParty.MyDropDown) {
        if (Array.isArray(jsonData.CreateParty.MyDropDown)) {
            jsonData.CreateParty.MyDropDown.forEach((dropdown) => {
                if (Array.isArray(dropdown.dropdown)) {
                    dropdown.dropdown.forEach((item) => {
                        const name = item.name._text;
                        schemaDefinition[name] = String;
                    });
                } else {
                    const item = dropdown.dropdown;
                    const name = item.name._text;
                    schemaDefinition[name] = String;
                }
            });
        } else {
            if (Array.isArray(jsonData.CreateParty.MyDropDown.dropdown)) {
                jsonData.CreateParty.MyDropDown.dropdown.forEach((item) => {
                    const name = item.name._text;
                    schemaDefinition[name] = String;
                });
            } else {
                const item = jsonData.CreateParty.MyDropDown.dropdown;
                const name = item.name._text;
                schemaDefinition[name] = String;
            }
        }
    }
    if (jsonData.CreateParty.CheckBox) {
        if (Array.isArray(jsonData.CreateParty.CheckBox.input)) {
            jsonData.CreateParty.CheckBox.input.forEach((input, index) => {
                const check = input.name._text;
                // const type = input.type._text
                const type = input.type._attributes.type;
                if (type === 'Boolean') {
                    schemaDefinition[check] = Boolean;
                }
                else {
                    schemaDefinition[check] = String
                }
            });
        } else {
            const input = jsonData.CreateParty.CheckBox.input;
            const check = input.name._text;
            // const type = input.type._text;
            const type = input.type._attributes.type;
            if (type === 'Boolean') {
                schemaDefinition[check] = Boolean;
            }
            else {
                schemaDefinition[check] = String
            }
        }
    }

    if (jsonData.CreateParty.Radiobutton) {
        if (Array.isArray(jsonData.CreateParty.Radiobutton.input)) {
            jsonData.CreateParty.Radiobutton.input.forEach((input, index) => {
                const check = input.name._text;
                const type = input.type._text
                schemaDefinition[check] = String
            });
        } else {
            const input = jsonData.CreateParty.Radiobutton.input;
            const check = input.name._text;
            schemaDefinition[check] = String
        }
    }
    return new mongoose.Schema(schemaDefinition, { timestamps: true });
}

export const PartySchema = await createSchema();
export const Party = mongoose.model('party', PartySchema);
