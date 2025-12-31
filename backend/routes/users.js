const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer'); // تأكد إن multer مثبت: npm i multer
const { getProfileImageUrl } = require('../utils/imageUtils');

const router = express.Router();

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// تكوين Multer لتخزين الملف مؤقتاً في الذاكرة
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  },
  storage: multer.memoryStorage(),
});

// GET /me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    const imageUrl = getProfileImageUrl(user.profileImage, user.cacheBuster || 0);
    res.json({
      ...user.toObject(),
      profileImage: imageUrl,
    });
  } catch (err) {
    console.error('خطأ جلب البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// PUT /profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    const updates = {};
    let cacheBusterIncremented = false;

    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone?.trim();
    if (bio !== undefined) updates.bio = bio?.trim() || '';

    // التعامل مع الصورة
    if (req.file) {
      // رفع الملف من الذاكرة إلى Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'sahla-profiles',
            public_id: `user_${req.user.id}`,
            overwrite: true,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      updates.profileImage = result.public_id;
      updates.cacheBuster = { $inc: 1 };
      cacheBusterIncremented = true;
    } else if (req.body.profileImage === '' || req.body.profileImage === null) {
      // حذف الصورة
      updates.profileImage = null;
      updates.cacheBuster = 0;
      cacheBusterIncremented = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ msg: 'المستخدم غير موجود' });
    }

    const finalCacheBuster = updatedUser.cacheBuster || 0;
    const imageUrl = getProfileImageUrl(updatedUser.profileImage, finalCacheBuster);

    res.json({
      ...updatedUser.toObject(),
      profileImage: imageUrl,
    });

    // إرسال تحديث real-time
    if (cacheBusterIncremented) {
      const io = req.app.get('io');
      if (io) {
        io.to(req.user.id.toString()).emit('profileUpdated', {
          userId: req.user.id,
          profileImage: imageUrl,
          cacheBuster: finalCacheBuster,
        });
      }
    }
  } catch (err) {
    console.error('خطأ تحديث البروفايل:', err);
    res.status(500).json({ msg: 'فشل حفظ التغييرات' });
  }
});

module.exports = router;
