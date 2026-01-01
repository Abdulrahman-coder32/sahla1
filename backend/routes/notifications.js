const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// جلب كل الإشعارات للمستخدم الحالي
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ user_id: req.user.id });

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('خطأ في جلب الإشعارات:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر أثناء جلب الإشعارات' });
  }
});

// جلب عدد الإشعارات الغير مقروءة
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user_id: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (err) {
    console.error('خطأ في حساب عدد الإشعارات الغير مقروءة:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// وضع علامة قراءة على كل الإشعارات (محسن ليكون موجود وشغال)
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user_id: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount || result.nModified // دعم الإصدارات القديمة والجديدة من MongoDB
    });
  } catch (err) {
    console.error('خطأ في وضع علامة قراءة على كل الإشعارات:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر أثناء تحديث حالة القراءة' });
  }
});

// وضع علامة قراءة على إشعار واحد
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user.id
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'الإشعار غير موجود أو لا يخصك' });
    }

    res.json(notification);
  } catch (err) {
    console.error('خطأ في تحديث حالة إشعار واحد:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// وضع علامة قراءة على كل إشعارات الشات المحدد (لما نفتح الشات)
router.patch('/mark-chat-read/:applicationId', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        user_id: req.user.id,
        type: 'new_message',
        application_id: req.params.applicationId
      },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount || result.nModified,
      message: 'تم تحديث إشعارات الشات بنجاح'
    });
  } catch (err) {
    console.error('خطأ في تحديث إشعارات الشات:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

module.exports = router;
