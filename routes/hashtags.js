const router = require("express").Router();
const Hashtag = require("../models/Hashtag");
const Post = require("../models/Post");

router.post("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { hashtag } = req.body;
    const post = await Post.findById(postId);
    const hashtagExist = await Hashtag.findOne({ hashtag });
    if (hashtagExist.length === 0) {
      const newHash = await new Hashtag({
        hashtag,
        posts: [post],
      });
      await newHash.save();
      res.status(200).json(newHash);
    } else {
      res.status(200).json("exists");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/:postId/:hash", async (req, res) => {
  try {
    const { postId, hash } = req.params;
    const post = await Post.findById(postId);
    const hashtag = await Hashtag.findOne({ hashtag: hash });
    await hashtag.posts.push(post);
    await hashtag.save();
    res.status(200).json(hashtag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
