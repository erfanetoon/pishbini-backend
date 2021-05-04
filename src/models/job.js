const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = Schema(
  {
    title: { type: String },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, required: true },
    phone: { type: String },
    link: { type: String },
    status: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
