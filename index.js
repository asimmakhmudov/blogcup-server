const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const postsRoute = require('./routes/posts');
const categoriesRoute = require('./routes/categories');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

dotenv.config();
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '/images')));

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: true,
    // useCreateIndex: true,
})
    .then(
        () => console.log('MongoDB Connected')
    )
    .catch(
        err => console.log(err)
    );

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    }, filename: (req, file, cb) => {
        cb(null, req.body.name)
    }
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("File has been uploaded");
})

// NOT WORKING
// var corsOptions = {
//     origin: 'https://limonblog.netlify.app',
//     optionsSuccessStatus: 200,
//     credentials: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept',
// }

app.use("/api/auth", authRoute, cors(corsOptions));
app.use("/api/users", usersRoute, cors(corsOptions));
app.use("/api/posts", postsRoute, cors(corsOptions));
app.use("/api/categories", categoriesRoute, cors(corsOptions));
// app.use(cors(corsOptions));

// updated
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.listen(process.env.PORT || 8000, () => {
    console.log("Backend is running on port " + process.env.PORT || "8000");
})

