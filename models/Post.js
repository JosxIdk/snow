const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    text: {
      type: String,
      max: 400,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
    reposted: {
      type: Boolean,
      default: false,
    },
    repostedPost: {
      type: String,
    },
    repostedBy: {
      type: Array,
    },
    poll: {
      type: Array,
    },
    isGroupPost: {
      type: Boolean,
      default: false,
    },
    groupData: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
