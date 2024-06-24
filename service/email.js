import nodemailer from "nodemailer";

var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'vikramsveltose022@gmail.com',
        pass: 'hpjswgwumxuupbsa'
    },
});
export default transporter;