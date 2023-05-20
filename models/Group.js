const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    title: {
      type: String,
      max: 20,
      min: 4,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    groupPic: {
      type: String,
      default: "",
    },
    groupCover: {
      type: String,
      default: "",
    },
    members: {
      type: Array,
    },
    admins: {
      type: Array,
    },
    private: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", GroupSchema);
