const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pointSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    match: { type: Schema.Types.ObjectId, required: true },
    competition: { type: Schema.Types.ObjectId, required: true },
    point: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Point", pointSchema);
