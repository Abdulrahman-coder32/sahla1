const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

const Message = require('./models/Message');
const Application = require('./models/Application');
const Notification = require('./models/Notification');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set('io', io);

// ─────────────────────────────
// MIDDLEWARES (مهم)
// ─────────────────────────────

// ✅ لازم يكونوا فوق routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────
// API Routes
// ─────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

// ─────────────────────────────
// Socket helper
// ─────────────────────────────
const emitProfileUpdate = (userId, profileImageUrl, cacheBuster) => {
  io.to(userId.toString()).emit('profileUpdated', {
    userId,
    profileImage: profileImageUrl,
    cacheBuster
  });
};

app.set('emitProfileUpdate', emitProfileUpdate);

// ─────────────────────────────
// Socket.IO Auth
// ─────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('لا يوجد توكن'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    next(new Error('توكن غير صالح'));
  }
});

// ─────────────────────────────
// Socket.IO Logic
// ─────────────────────────────
io.on('connection', (socket) => {
  console.log('مستخدم متصل:', socket.user?.id);

  if (socket.user?.id) {
    socket.join(socket.user.id.toString());
  }

  socket.on('joinChat', (applicationId) => {
    socket.join(applicationId);
  });

  socket.on('sendMessage', async ({ application_id, message }) => {
    if (!message?.trim()) return;

    try {
      const newMessage = new Message({
        application_id,
        sender_id: socket.user.id,
        message: message.trim(),
        timestamp: new Date()
      });

      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender_id', 'name');

      io.to(application_id).emit('newMessage', populatedMessage);

      const appData = await Application.findById(application_id)
        .populate('job_id', 'owner_id')
        .populate('seeker_id', 'name');

      if (!appData) return;

      const recipientId =
        socket.user.id === appData.job_id.owner_id.toString()
          ? appData.seeker_id._id.toString()
          : appData.job_id.owner_id.toString();

      await Application.findByIdAndUpdate(application_id, {
        lastMessage: message.trim(),
        lastTimestamp: new Date(),
        $inc: { unreadCount: 1 }
      });

      io.to(recipientId).emit('unreadUpdate', {
        application_id,
        unreadCount: (appData.unreadCount || 0) + 1
      });

      const notificationData = {
        type: 'new_message',
        message: `لديك رسالة جديدة من ${populatedMessage.sender_id.name}`,
        application_id,
        read: false,
        createdAt: new Date()
      };

      await new Notification({
        user_id: recipientId,
        ...notificationData
      }).save();

      io.to(recipientId).emit('newNotification', notificationData);

    } catch (err) {
      console.error('❌ خطأ في السوكت:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('مستخدم انفصل:', socket.user?.id);
  });
});

// ─────────────────────────────
// Angular Frontend
// ─────────────────────────────
app.use(express.static(
  path.join(__dirname, 'fadahrak-frontend/dist/fadahrak-frontend')
));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(
      path.join(__dirname, 'fadahrak-frontend/dist/fadahrak-frontend/index.html')
    );
  }
});

// ─────────────────────────────
// Test route
// ─────────────────────────────
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend شغال تمام ✅' });
});

// ─────────────────────────────
// MongoDB Connection
// ─────────────────────────────
const connectWithRetry = () => {
  console.log('محاولة الاتصال بـ MongoDB...');

  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
  })
  .then(() => {
    console.log('✅ MongoDB متصل');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Mongo Error:', err.message);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();
