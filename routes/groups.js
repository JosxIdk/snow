const router = require("express").Router();
const Group = require("../models/Group");
const randomString = require("random-string");
//GET

router.get("/", async (req, res) => {
  try {
    const allGroups = await Group.find();
    res.status(200).json(allGroups);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/random", async (req, res) => {
  try {
    await Group.count().exec((err, count) => {
      const random = Math.floor(Math.random() * count);

      Group.findOne()
        .skip(random)
        .exec((err, result) => {
          if (result) {
            res.status(200).json(result);
          } else {
            res.status(500).json(err);
            console.log(err);
          }
        });
    });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//CREATE

router.post("/", async (req, res) => {
  try {
    const newGroup = await new Group({
      ...req.body,
      groupPic: `https://source.boringavatars.com/marble/120/${randomString(
        20
      )}/?colors=5FC9F3,2E79BA,1E549F,081F37,247881,43919B,30AADD,00FFC6,F7E2E2,61A4BC,5B7DB1,1A132F,201A1A40,20270082,207A0BC0,20FA58B6,B20600,FF5F00`,
      groupCover: "https://i.imgur.com/d9fNis2.jpg",
    });
    const savedGroup = await newGroup.save();
    res.status(200).json(savedGroup);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//UPDATE

router.put("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(groupId);
    if (group.members.includes(userId)) {
      await group.updateOne({
        $set: req.body,
      });
      group.save();
    } else {
      res.status(403).json("You only can update your groups!");
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.put("/join/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group.members.includes(userId)) {
      await group.updateOne({
        $push: {
          members: userId,
        },
      });
      group.save();
      res.status(200).json(group);
    } else {
      await group.updateOne({
        $pull: {
          members: userId,
        },
      });
      group.save();
      res.status(200).json(group);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Join Failed");
  }
});

//DELETE

module.exports = router;
