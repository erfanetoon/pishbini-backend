const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const periodSchema = Schema(
  {
    name: { type: String, required: true },
    competition: { type: Schema.Types.ObjectId, required: true },
    bestUser: { type: Schema.Types.ObjectId, required: true },
    bestUserPoint: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Period", periodSchema);
