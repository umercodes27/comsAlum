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
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middleware/auth.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import chatRoutes from './routes/chat.js';
import { users, posts } from './data/index.js';
import videoRoutes from './routes/video.js'; 


dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.post("/auth/register", upload.single("picture"), (req, res, next) => {
  register(req, res).catch(next);
});

app.post("/posts", verifyToken, upload.single("picture"), (req, res, next) => {
  createPost(req, res).catch(next);
});




app.use('/auth', authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);
app.use("/video", videoRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 6001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Server running with Socket.IO on port: ${PORT}`);
    });

    io.on('connection', (socket) => {
      console.log('🔌 User connected:', socket.id);

      // Handle user joining a video room
      socket.on('join_video_room', ({ userId, roomName }) => {
        console.log(`User ${userId} is joining room ${roomName}`);
        socket.join(roomName);
        io.to(roomName).emit('user_joined', { userId });
      });

      socket.on('join', ({ userId }) => {
        console.log(`🔗 User ${userId} joined personal room`);
        socket.join(userId);
      });

      // Caller initiates a call
      socket.on('call_user', ({ from, to, roomName }) => {
        console.log(`📞 ${from} is calling ${to} for room ${roomName}`);
        io.to(to).emit('call_user', { from, roomName });
      });

      // Callee accepts the call
      socket.on('accept_call', ({ from, to, roomName }) => {
        console.log(`✅ ${from} accepted call from ${to}`);
        io.to(to).emit('call_accepted', { roomName });
      });

      // Callee rejects the call
      socket.on('reject_call', ({ from, to }) => {
        console.log(`❌ ${from} rejected call from ${to}`);
        io.to(to).emit('call_rejected');
      });


      // Handle sending video/audio messages or notifications
      socket.on('send_video_message', ({ sender, roomName, message }) => {
        console.log(`Message from ${sender} in room ${roomName}: ${message}`);
        io.to(roomName).emit('receive_video_message', { sender, message });
      });

      // Handle sending text messages
      socket.on('send_message', async ({ sender, receiver, content }) => {
        const chat = await Chat.findOneAndUpdate(
          { participants: { $all: [sender, receiver] } },
          { $setOnInsert: { participants: [sender, receiver] } },
          { new: true, upsert: true }
        );

        const message = await Message.create({
          chatId: chat._id,
          sender,
          receiver,
          content
        });

        io.to(receiver).emit('receive_message', message);
      });

      socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
      });
    });

  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });


// Uncomment the following lines to seed the database with initial data
// mongoose.connection.once('open', async () => {
//   console.log("Seeding database with initial data...");
//   await User.insertMany(users);
//   await Post.insertMany(posts);
//   console.log("Database seeded successfully.");
// });
//   return enrichedChats;
//       })
//     );
//
//
//     res.status(200).json(enrichedChats);
//   } catch (err) {
//     console.error("❌ Error in getUserChats:", err);
//     res.status(500).json({ error: "Failed to fetch user chats" });
//   }
