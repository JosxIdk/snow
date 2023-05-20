const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Group = require("../models/Group");
const Pusher = require("pusher");

//CONFIGURE PUSHER

const pusher = new Pusher({
  appId: "1442710",
  key: "33ae193fbdb955a596de",
  secret: "66f0cc15f9d27759e80a",
  cluster: "us2",
  useTLS: true,
  forceTLS: true,
});

//CREATE

router.post("/", async (req, res) => {
  try {
    const post = new Post(req.body);
    const newPost = await post.save();
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.post("/repost", async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const post = await Post.findById(postId);
    if (!post.repostedBy.includes(userId)) {
      const repost = new Post(req.body);
      await post.updateOne({
        $push: {
          repostedBy: userId,
        },
      });
      const newRepost = await repost.save();
      res.status(200).json(newRepost);
    } else {
      await post.updateOne({
        $pull: {
          repostedBy: userId,
        },
      });
      const deletedPost = await Post.findOneAndDelete({
        repostedPost: post._id,
        userId,
      });
      res.status(200).json("Post has beed deleted");
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//CREATE POLL

router.post("/poll", async (req, res) => {
  try {
    const pollPost = await new Post(req.body);
    const newPoll = await pollPost.save();
    res.status(200).json(newPoll);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//UPDATE

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(id);
    if (post.userId === userId) {
      const updatedPost = await post.updateOne({
        $set: req.body,
      });
      res.status(200).json("Post has been updated");
    } else {
      res.status(403).json("You only cant update your post!");
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//CREATE NEW COMMENT

router.put("/comment/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    await post.comments.push({ ...req.body });
    post.save();
    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json(res);
  }
});

//DELETE COMMENT

router.delete("/comment/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    await post.comments.pull({ ...req.body });
    post.save();
    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/poll/:id/:poll", async (req, res) => {
  try {
    const { id, poll } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    await post.poll[poll].votes.push(userId);
    post.save();
    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//PIN A POST

router.put("/pin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    const allPost = await Post.find();
    const postPinned = await allPost.filter((post) => post.pinned === true);

    if (postPinned.length === 0) {
      await post.updateOne({
        pinned: true,
      });
      res.status(200).json("Post pinned");
    } else if (post.pinned) {
      await post.updateOne({
        pinned: false,
      });
      res.status(200).json("Post unpinned");
    } else {
      const postToUpdate = await Post.findById(postPinned[0]._id);
      await postToUpdate.updateOne({
        pinned: false,
      });
      await post.updateOne({
        pinned: true,
      });
      res.status(200).json("Unpinned previus post, pinned new post");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Error an ocurred.");
  }
});

//DELETE

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post has been deleted");
    } else {
      res.status(403).json("You only cant delete your post!");
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//LIKE

router.put("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne(
        {
          $push: {
            likes: userId,
          },
        },
        {},
        (err, numberAffected) => {
          pusher.trigger(
            "post-events",
            "postAction",
            { action: "Like", postId: req.params.id },
            req.body.socketId
          );
        }
      );

      res.status(200).json("Post has been liked");
    } else {
      await post.updateOne(
        {
          $pull: {
            likes: userId,
          },
        },
        {},
        (err, numberAffected) => {
          pusher.trigger(
            "post-events",
            "postAction",
            { action: "Dislike", postId: req.params.id },
            req.body.socketId
          );
        }
      );
      res.status(200).json("Post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//GET

router.get("/get/all", async (req, res) => {
  try {
    const allPosts = await Post.find();
    res.status(200).json(allPosts);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/get/all/:limit/:offset", async (req, res) => {
  try {
    const { limit, offset } = req.params;
    const totalPosts = await Post.count();
    if (totalPosts - offset < 0) {
      res.status(200).json("limit");
    } else {
      const posts = (
        await Post.find()
          .skip(totalPosts - offset)
          .limit(limit)
      ).reverse();
      res.status(200).json(posts);
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const actualUser = await User.findOne({ username });
    const userPosts = await Post.find({ userId: actualUser._id });

    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/profile/:username/:limit/:offset", async (req, res) => {
  try {
    const { username, limit, offset } = req.params;
    const actualUser = await User.findOne({ username });
    const userPostsCount = await Post.find({ userId: actualUser._id }).count();

    if (userPostsCount - offset <= 0) {
      res.status(200).json("limit");
    } else {
      const posts = (
        await Post.find({ userId: actualUser._id })
          .skip(userPostsCount - offset)
          .limit(limit)
      ).reverse();
      res.status(200).json(posts);
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//GET GROUP POSTS

router.get("/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const allPosts = await Post.find();
    const groupPosts = allPosts.filter(
      (post) => post.isGroupPost && post.groupData?._id === groupId
    );
    res.status(200).json(groupPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error getting posts!");
  }
});

//GET COMMENTS

router.get("/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    const { comments } = post._doc;
    res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
