const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const settingSchema = Schema(
  {
    servicePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
