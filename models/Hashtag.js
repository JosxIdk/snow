const mongoose = require("mongoose");

const HashtagSchema = mongoose.Schema(
  {
    hashtag: {
      type: String,
    },
    posts: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hashtag", HashtagSchema);
