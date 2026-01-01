const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إعداد مجلد رفع الملفات
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'messages');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 ميجا
});

// جلب الرسائل
router.get('/:applicationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ application_id: req.params.applicationId })
      .sort({ timestamp: 1 })
      .populate('sender_id', 'name profileImage cacheBuster');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'خطأ في جلب الرسائل' });
  }
});

// دالة مساعدة لتحديث قائمة الشات مع ضمان إرسال otherUser + cacheBuster جديد دائمًا
async function handleChatListUpdate(io, application_id, userId, triggerForBoth = false) {
  try {
    const app = await Application.findById(application_id)
      .populate({
        path: 'job_id',
        populate: { path: 'owner_id', select: 'name profileImage cacheBuster' }
      })
      .populate('seeker_id', 'name profileImage cacheBuster');

    if (!app) return;

    const isOwner = userId === app.job_id.owner_id._id.toString();
    const senderUnread = isOwner ? app.unreadCounts.owner || 0 : app.unreadCounts.seeker || 0;
    const recipientUnread = isOwner ? app.unreadCounts.seeker || 0 : app.unreadCounts.owner || 0;
    const recipientId = isOwner ? app.seeker_id._id.toString() : app.job_id.owner_id._id.toString();

    const basePayload = {
      application_id,
      lastMessage: app.lastMessage || 'ابدأ المحادثة',
      lastTimestamp: app.lastTimestamp || app.updatedAt,
      unreadCount: senderUnread,
      otherUser: isOwner
        ? { name: app.seeker_id.name, profileImage: app.seeker_id.profileImage, cacheBuster: Date.now() }
        : { name: app.job_id.owner_id.name, profileImage: app.job_id.owner_id.profileImage, cacheBuster: Date.now() }
    };

    // تحديث للمستخدم الحالي (المرسل أو اللي فتح الشات)
    io.to(userId).emit('chatListUpdate', basePayload);

    // تحديث للطرف الآخر (إما دائمًا أو فقط لو triggerForBoth = true)
    if (recipientId && (triggerForBoth || userId !== recipientId)) {
      io.to(recipientId).emit('chatListUpdate', {
        ...basePayload,
        unreadCount: recipientUnread,
        otherUser: isOwner
          ? { name: app.job_id.owner_id.name, profileImage: app.job_id.owner_id.profileImage, cacheBuster: Date.now() }
          : { name: app.seeker_id.name, profileImage: app.seeker_id.profileImage, cacheBuster: Date.now() }
      });
    }
  } catch (err) {
    console.error('خطأ في handleChatListUpdate:', err);
  }
}

// دالة مساعدة للرسائل الجديدة
async function handleNewMessage(req, res, populatedMessage, messagePreview) {
  const { application_id } = req.body;
  const io = req.app.get('io');

  try {
    const app = await Application.findById(application_id)
      .populate({
        path: 'job_id',
        populate: { path: 'owner_id', select: 'name profileImage cacheBuster' }
      })
      .populate('seeker_id', 'name profileImage cacheBuster');

    if (!app) {
      return res.status(404).json({ msg: 'المحادثة غير موجودة' });
    }

    const isOwner = req.user.id === app.job_id.owner_id._id.toString();
    const recipientId = isOwner ? app.seeker_id._id.toString() : app.job_id.owner_id._id.toString();

    const updateData = {
      lastMessage: messagePreview,
      lastTimestamp: new Date()
    };

    if (req.user.id !== recipientId) {
      const recipientRole = isOwner ? 'seeker' : 'owner';
      updateData.$inc = { [`unreadCounts.${recipientRole}`]: 1 };
    }

    const updatedApp = await Application.findByIdAndUpdate(application_id, updateData, { new: true });

    // إرسال الرسالة الجديدة للروم
    io.to(application_id).emit('newMessage', populatedMessage);

    const recipientUnread = isOwner ? updatedApp.unreadCounts.seeker : updatedApp.unreadCounts.owner;

    // تحديث قائمة الشات للطرفين مع cacheBuster جديد
    await handleChatListUpdate(io, application_id, req.user.id, true);

    // unreadUpdate للمستقبل فقط
    if (req.user.id !== recipientId) {
      io.to(recipientId).emit('unreadUpdate', {
        application_id,
        unreadCount: recipientUnread
      });
    }

    // إشعارات للمستقبل فقط
    if (req.user.id !== recipientId) {
      const notificationData = {
        type: 'new_message',
        message: `لديك رسالة جديدة من ${populatedMessage.sender_id.name}`,
        application_id,
        read: false,
        createdAt: new Date()
      };

      io.to(recipientId).emit('newNotification', notificationData);
      io.to(recipientId).emit('newMessageNotification', {
        type: 'new_message',
        application_id,
        message: 'لديك رسالة جديدة',
        from: populatedMessage.sender_id.name
      });

      const newNotif = new Notification({
        user_id: recipientId,
        ...notificationData
      });
      await newNotif.save();
    }

    res.json(populatedMessage);
  } catch (err) {
    console.error('خطأ في معالجة الرسالة الجديدة:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
}

// إرسال رسالة نصية
router.post('/', auth, async (req, res) => {
  const { application_id, message } = req.body;
  if (!application_id || !message?.trim()) {
    return res.status(400).json({ msg: 'بيانات ناقصة' });
  }

  try {
    const newMessage = new Message({
      application_id,
      sender_id: req.user.id,
      type: 'text',
      message: message.trim(),
      timestamp: new Date()
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'name profileImage cacheBuster');

    await handleNewMessage(req, res, populatedMessage, message.trim());
  } catch (err) {
    console.error('خطأ في إرسال الرسالة النصية:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// إرسال ميديا
router.post('/media', auth, upload.single('file'), async (req, res) => {
  const { application_id, type, filename: clientFilename } = req.body;
  const file = req.file;

  if (!file || !application_id) {
    return res.status(400).json({ msg: 'يجب رفع ملف وتحديد application_id' });
  }

  try {
    const fileUrl = `/uploads/messages/${file.filename}`;
    const messageType = type || 'file';

    const newMessage = new Message({
      application_id,
      sender_id: req.user.id,
      type: messageType,
      filename: clientFilename || file.originalname,
      url: fileUrl,
      size: file.size,
      timestamp: new Date()
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'name profileImage cacheBuster');

    const preview = `[${messageType === 'image' ? 'صورة' : messageType === 'audio' ? 'رسالة صوتية' : 'ملف'}]`;

    await handleNewMessage(req, res, populatedMessage, preview);
  } catch (err) {
    console.error('خطأ في رفع الميديا:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر أثناء رفع الملف' });
  }
});

// وضع علامة قراءة + تحديث قائمة الشات للطرفين
router.patch('/:applicationId/mark-read', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate({
        path: 'job_id',
        populate: { path: 'owner_id', select: 'name profileImage cacheBuster' }
      })
      .populate('seeker_id', 'name profileImage cacheBuster');

    if (!application) {
      return res.status(404).json({ msg: 'الدردشة غير موجودة' });
    }

    const isOwner = req.user.id === application.job_id.owner_id?._id.toString();
    const fieldToReset = isOwner ? 'unreadCounts.owner' : 'unreadCounts.seeker';

    const updatedApp = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { $set: { [`${fieldToReset}`]: 0 } },
      { new: true }
    );

    const io = req.app.get('io');
    if (io) {
      // تحديث قائمة الشات للطرفين مع cacheBuster جديد
      await handleChatListUpdate(io, req.params.applicationId, req.user.id, true);

      // unreadUpdate للمرسل (اللي عمل mark read)
      io.to(req.user.id).emit('unreadUpdate', {
        application_id: req.params.applicationId,
        unreadCount: 0
      });

      // unreadUpdate للطرف الآخر
      const recipientId = isOwner ? application.seeker_id?._id.toString() : application.job_id.owner_id?._id.toString();
      if (recipientId && recipientId !== req.user.id) {
        const recipientUnread = isOwner ? updatedApp.unreadCounts.seeker : updatedApp.unreadCounts.owner;
        io.to(recipientId).emit('unreadUpdate', {
          application_id: req.params.applicationId,
          unreadCount: recipientUnread
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('خطأ في وضع علامة قراءة:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

module.exports = router;
