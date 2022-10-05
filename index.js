const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const postsRoute = require('./routes/posts');
const categoriesRoute = require('./routes/categories');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
dotenv.config();
app.use(express.json());

// cors middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(cors());

// Connect to DB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(
    () => console.log('MongoDB Connected')
)
.catch(
    err => console.log(err)
);

// for local storage
// app.use('/images', express.static(path.join(__dirname, '/images')));
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images');
//     }, filename: (req, file, cb) => {
//         cb(null, req.body.name)
//     }
// });
// const upload = multer({ storage: storage });
// app.post("/api/upload", upload.single("file"), async(req, res) => {
//     res.status(200).json("File has been uploaded");
// })


// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blog',
        allowedFormats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        res.status(200).json('File has been uploaded');
    } catch (err) {
        console.log(err);
    }
});
app.use('/images', express.static(path.join(__dirname, '/images')));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });


// routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/categories", categoriesRoute);

app.listen(process.env.PORT || 8000, () => {
    console.log("Backend is running on port " + process.env.PORT || "8000");
})

