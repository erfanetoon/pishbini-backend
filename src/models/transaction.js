const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = Schema(
  {
    name: { type: String, required: true },
    status: { type: String, required: true },
    amount: { type: String, required: true },
    code: { type: String, required: true },
    payAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
