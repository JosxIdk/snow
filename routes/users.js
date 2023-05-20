const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

//GET

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const { password, updatedAt, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/get/all", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/get/all/:limit/:offset", async (req, res) => {
  try {
    const { limit, offset } = req.params;
    const totalUsers = await User.count();
    if (totalUsers - offset < 0) {
      res.status(200).json("limit");
    } else {
      const users = await User.find();
      res.status(200).json(users.slice(5, 8));
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    const { password, updatedAt, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (err) {
    res.status(500).json(err);
  }
});

//SEARCH

router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    const users = await User.find();

    const keys = ["name", "lastname", "username"];

    const searchUsers = users.filter((user) =>
      keys.some(
        (key) =>
          user[key].includes(query) ||
          user[key].toLowerCase().includes(query) ||
          user[key].toUpperCase().includes(query)
      )
    );

    res.status(203).json(searchUsers.slice(0, 6));
  } catch (err) {
    console.log(err);
    res.status(500).json("Error searching users");
  }
});

//GET FRIENDS

router.get("/:id/friends", async (req, res) => {
  try {
    const { id } = req.params;
    const { friends } = await User.findById(id);
    res.status(200).json(friends);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error gettings friends");
  }
});

//VALID SESSION

router.put("/session/:userId", async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json("Error getting session");
  }
});

//UPDATE

router.put("/:id", async (req, res) => {
  const { userId, password } = req.body;
  if (userId === req.params.id) {
    if (password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      } catch (err) {
        return res.status(500).jsonconsole.log(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("The account has been updated successfully.");
    } catch (err) {
      return res.status(500).jsonconsole.log(err);
    }
  } else {
    res.status(403).json("You can't update this acc!");
  }
});

router.put("/badge/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge } = req.body;
    const user = await User.findByIdAndUpdate(userId, {
      $push: { badges: badge },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json("Error updating user badges");
  }
});

//DELETE

router.delete("/:id", async (req, res) => {
  const { userId, password } = req.body;
  if (userId === req.params.id) {
    try {
      await User.findByIdAndDelete({ _id: req.params.id });
      const userPosts = await Post.find({ userId: req.params.id }).deleteMany();
      res.status(200).json("The account has been deleted successfully.");
    } catch (err) {
      res.status(500).jsonconsole.log(err);
      console.log(err);
    }
  } else {
    res.status(403).json("You can't delete this acc!");
  }
});

//Send Friend Request

router.put("/:id/follow", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (userId !== id) {
    try {
      const user = await User.findById(id);
      const currentUser = await User.findById(userId);
      if (user.friendReqsSend.includes(userId)) {
        await user.updateOne({
          $push: { friends: userId, friendReqs: userId },
        });
        await currentUser.updateOne({
          $push: { friends: id, friendReqsSend: id },
        });
        user.save();
        currentUser.save();
        res.status(200).json("Now we are friends");
      } else if (!currentUser.friendReqsSend.includes(id)) {
        await user.updateOne({ $push: { friendReqs: userId } });
        await currentUser.updateOne({ $push: { friendReqsSend: id } });

        user.save();
        currentUser.save();
        res.status(200).json("Send friend Request");
      } else {
        await user.updateOne({ $pull: { friendReqs: userId } });
        await currentUser.updateOne({ $pull: { friendReqsSend: id } });

        user.save();
        currentUser.save();
        res.status(200).json("unsend friend Request");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Same ID!");
  }
});

//Unsend Friend Request

router.put("/:id/unfollow", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (userId !== id) {
    try {
      const user = await User.findById(id);
      const currentUser = await User.findById(userId);
      if (user.friends.includes(userId)) {
        await user.updateOne({
          $pull: { friends: userId, friendReqs: userId },
        });
        await currentUser.updateOne({
          $pull: { friends: id, friendReqsSend: id },
        });
        user.save();
        currentUser.save();
        res
          .status(200)
          .json("Unsend friend Request and delete friend from the list");
      } else if (currentUser.friendReqsSend.includes(id)) {
        await user.updateOne({ $pull: { friendReqs: userId } });
        await currentUser.updateOne({ $pull: { friendReqsSend: id } });
        user.save();
        currentUser.save();
        res.status(200).json("Unsend friend Request");
      } else {
        res.status(403).json("You can't unsend fr this user again");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Same ID!");
  }
});

module.exports = router;
