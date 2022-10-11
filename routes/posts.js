const router = require('express').Router();
const { verifyToken, verifyTokenAndAdmin } = require('./verifyToken');
const Post = require("../models/Post")
const User = require("../models/User")

// Create
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    // const newPost = new Post(req.body)
    const newPost = new Post({
        title: "blog title",
        username: "admin",
        categories: "",
        photo: "",
        desc: "",
    });
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    }
    catch (err) {
        res.status(500).json(err)
    }
});

// Update Post
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true }
        );
        res.status(200).json(updatedPost)
    }
    catch (err) {
        res.status(500).json(err)
    }
});

// Delete
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json("Post has been deleted")
    } catch (err) {
        res.status(500).json(err)
    }
});

// GET Post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err)
    }
});

// GET All Post
router.get("/", async (req, res) => {
    const username = req.query.user;
    const catName = req.query.cat;
    try {
        let posts;
        if (username) {
            posts = await Post.find({ username })
        } else if (catName) {
            posts = await Post.find({
                categories: {
                    $in: [catName]
                }
            })
        } else {
            posts = await Post.find({})
        }
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router