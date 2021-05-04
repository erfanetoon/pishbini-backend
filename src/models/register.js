const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Register", registerSchema);
