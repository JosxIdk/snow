const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    post: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      max: 120,
      min: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", ReportSchema);
