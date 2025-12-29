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

// الصورة الديفولت اللي عايزها (اللي رفعتها)
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dv48puhaq/image/upload/c_fill,g_face,h_400,q_auto,r_max,w_400/v1767034237/photo_2025-12-29_20-47-41_ovo0fn.jpg';

// دالة URL - رجع الصورة الديفولت لو مفيش
const getProfileImageUrl = (publicId) => {
  if (!publicId) {
    return DEFAULT_AVATAR; // دي هتظهر لكل يوزر بدون صورة
  }
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    radius: 'max'
  });
};

// GET /me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    user.profileImage = getProfileImageUrl(user.profileImage);
    res.json(user);
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

    if (profileImage && profileImage.startsWith('data:image')) {
      const result = await cloudinary.uploader.upload(profileImage, {
        folder: 'sahla-profiles',
        public_id: `user_${req.user.id}`,
        overwrite: true,
        resource_type: 'image'
      });
      updates.profileImage = result.public_id;
    } else if (profileImage === null || profileImage === '') {
      updates.profileImage = null; // لو اليوزر مسح الصورة يدويًا
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    updatedUser.profileImage = getProfileImageUrl(updatedUser.profileImage);
    res.json(updatedUser);
  } catch (err) {
    console.error('خطأ تحديث البروفايل:', err);
    res.status(500).json({ msg: 'فشل رفع الصورة أو حفظ البيانات' });
  }
});

module.exports = router;
