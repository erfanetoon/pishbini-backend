const nodemailer = require("nodemailer");

const email = "info@irpishbini.ir";
const transporter = nodemailer.createTransport({
  host: "mail.irpishbini.ir",
  port: 465,
  secure: true,
  auth: {
    user: email,
    pass: "=$aavVjO5HO$",
  },
});

module.exports = {
  email,
  transporter,
};
