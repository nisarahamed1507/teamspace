
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import models
const Message = require('./models/Message');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Add this line after your auth routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);


// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

// Socket.io for real-time messaging with MongoDB
io.on('connection', async (socket) => {
  console.log('New client connected:', socket.id);

require('./sockets/video')(io);

  
  // Send previous messages from database
try {
  const messages = await Message.find().sort({ createdAt: 1 }).limit(50);
  
  // Map messages to match frontend expectations
  const formattedMessages = messages.map(msg => ({
    id: msg._id,
    text: msg.text,
    userEmail: msg.userEmail,
    timestamp: msg.createdAt  // ✅ Convert createdAt to timestamp
  }));
  
  socket.emit('previous-messages', formattedMessages);
} catch (error) {
  console.error('Error fetching messages:', error);
}

  
  // Handle new messages
  socket.on('send-message', async (messageData) => {
    try {
      const newMessage = new Message({
        text: messageData.text,
        user: messageData.userId,
        userEmail: messageData.userEmail,
        channel: messageData.channel || 'general'
      });
      
      await newMessage.save();
      
      // Send message to all connected clients
      io.emit('receive-message', {
        id: newMessage._id,
        text: newMessage.text,
        userEmail: newMessage.userEmail,
        timestamp: newMessage.createdAt
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
