const router = require("express").Router();
const Message = require("../models/Message");

//CREATE

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).send(savedMessage);
  } catch (err) {
    res.status(500).sendconsole.log(err);
    console.log(err);
  }
});

//GET

router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId });
    res.status(200).send(messages);
  } catch (err) {
    res.status(500).sendconsole.log(err);
    console.log(err);
  }
});

router.get("/:chatId/:limit/:offset", async (req, res) => {
  try {
    const { chatId, limit, offset } = req.params;
    const messageCount = await Message.count();
    const messages = await Message.find({ chatId })
      .limit(limit)
      .skip(messageCount - offset - limit);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//UPDATE

router.put(":/chatId", async (req, res) => {});

//DELETE

router.delete("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(chatId);
    deletedMessage.save();
  } catch (err) {
    res.status(500).sendconsole.log(err);
    console.log(err);
  }
});

module.exports = router;
