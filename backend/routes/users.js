const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profile';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميجا max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('صور فقط (jpeg, jpg, png, gif, webp)'));
  }
});

// GET /api/users/me - جلب بيانات المستخدم الحالي
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    // إضافة الـ full URL للصورة + كسر الكاش
    if (user.profileImage) {
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/profile/`;
      user.profileImage = baseUrl + user.profileImage + '?t=' + Date.now();
    }

    res.json(user);
  } catch (err) {
    console.error('خطأ في جلب البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// PUT /api/users/profile - تحديث البيانات والصورة
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone || ''
    };

    // لو في صورة جديدة
    if (req.file) {
      // احذف الصورة القديمة لو موجودة ومش default
      const oldUser = await User.findById(req.user.id);
      if (oldUser.profileImage && oldUser.profileImage !== 'default.jpg') {
        const oldFileName = path.basename(oldUser.profileImage.split('?')[0]); // نتجاهل ?t=...
        const oldPath = path.join(__dirname, '..', 'uploads', 'profile', oldFileName);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updates.profileImage = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password');

    // إضافة الـ full URL + كسر الكاش
    if (updatedUser.profileImage) {
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/profile/`;
      updatedUser.profileImage = baseUrl + updatedUser.profileImage + '?t=' + Date.now();
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('خطأ في تحديث البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في حفظ التغييرات' });
  }
});

// الحفاظ على الـ route القديم (اختياري)
router.patch('/:id', auth, async (req, res) => {
  if (req.params.id !== req.user.id) return res.status(403).json({ msg: 'غير مصرح' });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    if (user.profileImage) {
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/profile/`;
      user.profileImage = baseUrl + path.basename(user.profileImage.split('?')[0]) + '?t=' + Date.now();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'خطأ في التحديث' });
  }
});

module.exports = router;
