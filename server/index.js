import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middleware/auth.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { users, posts } from './data/index.js';

// Configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables');
  process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('dev')); // 'dev' format gives more detailed logs
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Be more specific in production
  credentials: true
}));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// File storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to avoid filename conflicts
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes with files
app.post("/auth/register", upload.single("picture"), (req, res, next) => {
  // Add error handling for file upload
  register(req, res).catch(next);
});

app.post("/posts", verifyToken, upload.single("picture"), (req, res, next) => {
  createPost(req, res).catch(next);
});

// Routes
app.use('/auth', authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// MongoDB setup
const PORT = process.env.PORT || 6001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Only start server after DB connection is established
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Uncomment to seed data (only for development)
      if (process.env.NODE_ENV === 'development') {
        // User.insertMany(users).catch(err => console.log('User seed error:', err));
        // Post.insertMany(posts).catch(err => console.log('Post seed error:', err));
      }
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

