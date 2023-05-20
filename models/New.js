const mongoose = require("mongoose");

const NewSchema = mongoose.Schema(
  {
    epigraph: {
      type: String,
      max: 20,
      min: 8,
    },
    title: {
      type: String,
      required: true,
      max: 25,
      min: 10,
    },
    subtitle: {
      type: String,
      min: 10,
      max: 25,
    },
    body: {
      type: String,
      required: true,
      max: 700,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("New", NewSchema);
