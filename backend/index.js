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

app.set('io', io); // عشان نستخدمه في الـ routes لو عايزين

// خدمة مجلد uploads كـ static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// زيادة حد حجم الـ body لدعم base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

// دالة مساعدة لإرسال تحديث الصورة عبر Socket
const emitProfileUpdate = (userId, profileImageUrl, cacheBuster) => {
  io.to(userId.toString()).emit('profileUpdated', {
    userId,
    profileImage: profileImageUrl,
    cacheBuster
  });
};

// نعمل export للدالة عشان نستخدمها في users.js
app.set('emitProfileUpdate', emitProfileUpdate);

// Socket.IO Logic
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('لا يوجد توكن'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    next(new Error('توكن غير صالح'));
  }
});

io.on('connection', (socket) => {
  console.log('مستخدم متصل بالسوكت:', socket.user?.id, 'دور:', socket.user?.role);

  if (socket.user?.id) {
    socket.join(socket.user.id.toString());
  }

  socket.on('joinChat', (applicationId) => {
    socket.join(applicationId);
    console.log(`المستخدم ${socket.user?.id} انضم للمحادثة: ${applicationId}`);
  });

  socket.on('sendMessage', async ({ application_id, message }) => {
    if (!message.trim()) return;
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

      const app = await Application.findById(application_id)
        .populate('job_id', 'owner_id')
        .populate('seeker_id', 'name');

      if (app) {
        const recipientId = socket.user.id === app.job_id.owner_id.toString()
          ? app.seeker_id._id.toString()
          : app.job_id.owner_id.toString();

        await Application.findByIdAndUpdate(application_id, {
          lastMessage: message.trim(),
          lastTimestamp: new Date(),
          $inc: { unreadCount: 1 }
        });

        io.to(recipientId).emit('unreadUpdate', {
          application_id,
          unreadCount: (app.unreadCount || 0) + 1
        });

        const notificationData = {
          type: 'new_message',
          message: `لديك رسالة جديدة من ${populatedMessage.sender_id.name}`,
          application_id,
          read: false,
          createdAt: new Date()
        };

        io.to(recipientId).emit('newNotification', notificationData);

        const newNotif = new Notification({
          user_id: recipientId,
          ...notificationData
        });
        await newNotif.save();

        io.to(recipientId).emit('newMessageNotification', {
          type: 'new_message',
          application_id,
          message: 'لديك رسالة جديدة',
          from: populatedMessage.sender_id.name
        });
      }
    } catch (err) {
      console.error('خطأ في حفظ أو إرسال الرسالة:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('مستخدم انفصل عن السوكت:', socket.user?.id);
  });
});

// ────────────────────────────────────────
// خدمة Angular Frontend
// ────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'fadahrak-frontend/dist/fadahrak-frontend')));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'fadahrak-frontend/dist/fadahrak-frontend/index.html'));
  } else {
    next();
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend شغال تمام مع Socket.IO!' });
});

// ────────────────────────────────────────
// اتصال MongoDB مع Retry Logic
// ────────────────────────────────────────
const connectWithRetry = () => {
  console.log('جاري محاولة الاتصال بـ MongoDB Atlas...');
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ تم الاتصال بـ MongoDB Atlas بنجاح');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 السيرفر شغال على البورت ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
    console.log('إعادة المحاولة بعد 5 ثواني...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();
