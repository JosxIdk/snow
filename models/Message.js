const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    chatId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
      max: 850,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
