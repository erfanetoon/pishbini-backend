const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const competitionSchema = Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number },
    champion: { type: Schema.Types.ObjectId },
    winner: { type: Schema.Types.ObjectId },
    isFinish: { type: Boolean, required: true },
    url: { type: String, unique: true, required: true },
    activePeriod: { type: Schema.Types.ObjectId },
    championPredictionDateTime: { type: Date, required: true },
    teams: { type: Array, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Competition", competitionSchema);
