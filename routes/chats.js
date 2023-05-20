const router = require("express").Router();
const Chat = require("../models/Chat");

//Create Chat

router.post("/", async (req, res) => {
  const newChat = new Chat({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedChat = await newChat.save();
    res.status(200).send(savedChat);
  } catch (err) {
    res.status(500).sendconsole.log(err);
    console.log(err);
  }
});

//Get Chat

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const chat = await Chat.find({
      members: {
        $in: [userId],
      },
    });
    res.status(200).send(chat);
  } catch (err) {
    res.status(500).sendconsole.log(err);
    console.log(err);
  }
});

//Delete Chat

router.delete("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error deleting chat!");
  }
});

module.exports = router;
