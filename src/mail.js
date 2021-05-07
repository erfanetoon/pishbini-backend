const nodemailer = require("nodemailer");

const email = "email";
const transporter = nodemailer.createTransport({
  host: "host",
  port: "port",
  secure: true,
  auth: {
    user: "email",
    pass: "password",
  },
});

module.exports = {
  email,
  transporter,
};
