const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// الصورة الديفولت
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

const getProfileImageUrl = (publicId, cacheBuster = 0) => {
  const url = publicId
    ? cloudinary.url(publicId, {
        secure: true,
        quality: 'auto',
        fetch_format: 'auto',
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        radius: 'max'
      })
    : DEFAULT_AVATAR;

  return `${url}?v=${cacheBuster}`;
};

// GET /me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    const imageUrl = getProfileImageUrl(user.profileImage, user.cacheBuster || 0);

    res.json({
      ...user.toObject(),
      profileImage: imageUrl
    });
  } catch (err) {
    console.error('خطأ جلب البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// PUT /profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, bio, profileImage } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;

    let cacheBusterIncremented = false;

    if (profileImage && profileImage.startsWith('data:image')) {
      const result = await cloudinary.uploader.upload(profileImage, {
        folder: 'sahla-profiles',
        public_id: `user_${req.user.id}`,
        overwrite: true,
        resource_type: 'image'
      });
      updates.profileImage = result.public_id;
      updates.$inc = { cacheBuster: 1 };
      cacheBusterIncremented = true;
    } else if (profileImage === null || profileImage === '') {
      updates.profileImage = null;
      updates.cacheBuster = 0;
      cacheBusterIncremented = true; // عشان نكسر الكاش حتى لو رجع للديفولت
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    const finalCacheBuster = updatedUser.cacheBuster || 0;
    const imageUrl = getProfileImageUrl(updatedUser.profileImage, finalCacheBuster);

    const responseUser = {
      ...updatedUser.toObject(),
      profileImage: imageUrl
    };

    res.json(responseUser);

    // إرسال تحديث real-time عبر Socket.IO إذا تغيرت الصورة
    if (cacheBusterIncremented || profileImage) {
      const io = req.app.get('io');
      if (io) {
        io.to(req.user.id.toString()).emit('profileUpdated', {
          userId: req.user.id,
          profileImage: imageUrl,
          cacheBuster: finalCacheBuster
        });
      }
    }

  } catch (err) {
    console.error('خطأ تحديث البروفايل:', err);
    res.status(500).json({ msg: 'فشل رفع الصورة أو حفظ البيانات' });
  }
});

module.exports = router;
