const router = require('express').Router();
const User = require('../models/User'); // User model
const Post = require('../models/Post'); // Post model
const CryptoJS = require('crypto-js'); // Password encryption
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

// Update user profile
router.put("/:id", async (req, res) => {
    if(req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    }
    try {
        const updateUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true}
        );
        res.status(200).json(updateUser)
    }
    catch (err) {
        res.status(500).json(err)
    }
});


// Delete user profile
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            try {
                await Post.deleteMany({ username: user.username })
                await User.findByIdAndDelete(req.params.id);
                res.status(200).json("User profile deleted!");
            }
            catch (err) {
                res.status(500).json(err);
            }
        }
        catch (err) {
            res.status(404).json("User not found!");
        }
    }
    else {
        res.status(401).json("You can delete only your profile!");
    }
});

router.delete("admin/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findById(req.params.id)
        res.status(200).json("User has been deleted by Admin")
    } catch(err) {
        res.status(500).json(err)
    }
})

// Get a user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, isAdmin, ...others } = user._doc;
        res.status(200).json(others);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

// GET All user
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new
    try {
        const users = query ? await User.find().sort({_id: -1}).limit(5) : await User.find()
        res.status(200).json(users);
    } catch(err) {
        res.status(500).json(err)
    }
})

//  Get user stats
router.get("/stats", verifyTokenAndAdmin, async (req, res)=> {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear()-1));
    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: {$sum: 1}
                }
            }
        ]);
        res.status(200).json(data)
    }
    catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router;