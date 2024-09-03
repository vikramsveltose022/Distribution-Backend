import nodemailer from "nodemailer";

var transporterss = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'vikramsveltose022@gmail.com',
        pass: 'mhxnhbobrhegjlat'
    },
});
export default transporterss;