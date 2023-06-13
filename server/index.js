import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import multer from 'multer';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { verifyToken } from './middleware/auth.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import User from '../server/models/user.js';
import Post from './models/post.js';
import { users, posts } from './data/index.js';

// Configurations (when you use type:module in package.json file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use('/assests', express.static(path.join(__dirname, 'public/assests')));

// File Storage ( saving file )
const storage = multer.diskStorage({
  distination: function (req, file, cb) {
    cb(null, 'public/assets');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

//Routes with files
app.post('/auth/register', upload.single('picture'), verifyToken, register); //'auth/register' is url, upload.single() is middleware and register is controller
app.post('/posts', verifyToken, upload.single('picture'), createPost);
// ROUTES
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

// MONGOOSE SET UP
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`Server Port:${PORT}`));
    // Add data
    await User.insertMany(users);
    await Post.insertMany(posts);
  })
  .catch((error) => console.log(`Connection failed: ${error} `));
