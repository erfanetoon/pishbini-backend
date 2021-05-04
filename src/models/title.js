const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const titleSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    competition: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Title", titleSchema);
