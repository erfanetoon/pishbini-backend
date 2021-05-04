const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchSchema = Schema(
  {
    home: { type: Schema.Types.ObjectId, required: true },
    away: { type: Schema.Types.ObjectId, required: true },
    matchDateTime: { type: Date },
    homeGoal: { type: Number },
    awayGoal: { type: Number },
    period: { type: Schema.Types.ObjectId, required: true },
    sentDateTime: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
