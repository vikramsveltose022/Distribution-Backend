import nodemailer from "nodemailer";

var transporterss = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'dakshglobalservices@gmail.com',
        pass: 'zjbizyfvtjjuabmb'
    },
});
export default transporterss;