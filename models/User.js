const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 4,
      max: 12,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      min: 3,
      max: 15,
    },
    lastname: {
      type: String,
      required: true,
      min: 5,
      max: 15,
    },
    email: {
      type: String,
      required: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 7,
      max: 25,
    },
    profilePic: {
      type: String,
      default: "",
    },
    coverPic: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    friendReqs: {
      type: Array,
      default: [],
    },
    friendReqsSend: {
      type: Array,
      default: [],
    },
    badges: {
      type: Array,
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    from: {
      type: String,
      max: 60,
    },
    verified: Boolean,
    verifiedBadge: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
