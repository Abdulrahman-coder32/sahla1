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
  limits: { fileSize: 5 * 1024 * 1024 },
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

// دالة مساعدة محسنة: إضافة full URL + cache buster + fallback لـ default.jpg
const addImageUrlAndCache = (user, req) => {
  // لو مفيش profileImage خالص، خليه default.jpg
  if (!user.profileImage || user.profileImage === 'default.jpg' || user.profileImage.trim() === '') {
    user.profileImage = 'default.jpg';
  }

  const baseUrl = `https://${req.get('host')}/uploads/profile/`;
  const cleanFilename = path.basename(user.profileImage.split('?')[0]);

  if (cleanFilename === 'default.jpg') {
    // للـ default: cache buster جديد كل مرة عشان يحدث لو غيرت الصورة يدويًا
    user.profileImage = `${baseUrl}default.jpg?t=${Date.now()}`;
  } else {
    user.profileImage = `${baseUrl}${cleanFilename}?t=${Date.now()}`;
  }

  return user;
};

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    user = addImageUrlAndCache(user, req);
    res.json(user);
  } catch (err) {
    console.error('خطأ في جلب البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// PUT /api/users/profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('-password');
    if (!currentUser) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    const updates = {
      name: req.body.name || currentUser.name,
      phone: req.body.phone || currentUser.phone || '',
      bio: req.body.bio || currentUser.bio || ''
    };

    if (req.file) {
      // حذف الصورة القديمة لو موجودة ومش default
      if (currentUser.profileImage && currentUser.profileImage !== 'default.jpg') {
        const oldFileName = path.basename(currentUser.profileImage.split('?')[0]);
        const oldPath = path.join(__dirname, '..', 'uploads', 'profile', oldFileName);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updates.profileImage = req.file.filename;
    } else {
      // لو مفيش ملف جديد، احتفظ بالقديم (أو default لو فاضي)
      updates.profileImage = currentUser.profileImage || 'default.jpg';
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    addImageUrlAndCache(updatedUser, req);
    res.json(updatedUser);
  } catch (err) {
    console.error('خطأ في تحديث البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في حفظ التغييرات' });
  }
});

// باقي الـ routes (زي PATCH) لو موجودة، خليها زي ما هي

module.exports = router;
