const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const Post = require("../models/Posts");
const { get } = require("request");

//Get all posts
//access public
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts) {
      return res.status(400).json({ msg: "There is no post found!" });
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


//Get Post By Id
//access private

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
};



//Get spacific posts
//access private
const getUserPosts = async (req, res) => {
  try {
    // get posts
    const posts = await Post.findOne({ user: req.user.id });

    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "No posts Found!" });
    }
    res.status(500).send("Server Error!");
  }
};

//Create Post
//access private
const createPost = [
  check("text", "Text is required").not().isEmpty(),
  //Controller Function
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findById(req.user.id).select("-password");

      // create
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      return res.status(200).json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
];

//Delete post
//access private
const deletePost = async (req, res) => {
  try {
    //delete post
    const post = await Post.findById(req.params.id);

    // check User
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.deleteOne();
    res.status(200).send("Post removed");
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found!" });
    }
    res.status(500).send("Server Error");
  }
};

//Like Post
//access private
const likePost = async (req, res) => {
  try {
    //check post
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post no found!" });
    }
    // check if post already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post Already liked" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
};

//Like Post
//access private
const unlikePost = async (req, res) => {
  try {
    //check post
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post no found!" });
    }
    // check if post not liked liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    //Get remove Index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
};

//Create comment
//access private
const createComent = [
  check("text", "Text is required").not().isEmpty(),
  //Controller Function
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");

      let post = await Post.findById(req.params.id);

      // create
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      await post.comments.unshift(newComment);
      await post.save();
      return res.status(200).json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
];

//Delete comment
//access private
const deleteComment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Find comment by comment ID (assuming you pass commentId in req.params.commentId)
    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Remove the comment
    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.commentId
    );

    await post.save();
    res.status(200).json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getAllPosts,
  getUserPosts,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  createComent,
  deleteComment,
  getPostById
};
