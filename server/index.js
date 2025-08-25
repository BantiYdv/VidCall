const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const agoraRoutes = require('./routes/agora');
const userRoutes = require('./routes/users');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agora', agoraRoutes);
app.use('/api/users', userRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { userId, role, roomId } = data;
    socket.join(roomId);
    connectedUsers.set(socket.id, { userId, role, roomId });
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', { userId, role });
    
    console.log(`User ${userId} (${role}) joined room ${roomId}`);
  });

  socket.on('leave-room', (data) => {
    const { roomId } = data;
    socket.leave(roomId);
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      socket.to(roomId).emit('user-left', { userId: userInfo.userId, role: userInfo.role });
      connectedUsers.delete(socket.id);
    }
  });

  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      socket.to(userInfo.roomId).emit('user-left', { userId: userInfo.userId, role: userInfo.role });
      connectedUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });

  // Video call signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });
});

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
