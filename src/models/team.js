const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = Schema(
  {
    name: { type: String, required: true },
    country: { type: String },
    city: { type: String },
    logo: { type: String, required: true },
    status: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
