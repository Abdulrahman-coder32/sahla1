const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// تكوين Cloudinary من الـ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// دالة لتحويل public_id إلى URL كامل محسن
const getProfileImageUrl = (publicId) => {
  if (!publicId) {
    return null; // مهم جدًا: نرجع null مش default image
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

// جلب البروفايل (GET /api/users/me)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'المستخدم غير موجود' });

    // لو مفيش صورة → null
    user.profileImage = getProfileImageUrl(user.profileImage);

    res.json(user);
  } catch (err) {
    console.error('خطأ جلب البروفايل:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// تحديث البروفايل (PUT /api/users/profile)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, bio, profileImage } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;

    // لو في صورة جديدة (base64)
    if (profileImage && profileImage.startsWith('data:image')) {
      const result = await cloudinary.uploader.upload(profileImage, {
        folder: 'sahla-profiles',
        public_id: `user_${req.user.id}`,
        overwrite: true,
        resource_type: 'image'
      });
      updates.profileImage = result.public_id;
    }
    // لو مفيش صورة جديدة وكان في صورة قديمة، نحافظ عليها
    // لو مفيش صورة أصلًا → نخليها null (مش default)

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // لو مفيش صورة في الداتابيز → null
    updatedUser.profileImage = getProfileImageUrl(updatedUser.profileImage);

    res.json(updatedUser);
  } catch (err) {
    console.error('خطأ تحديث البروفايل:', err);
    res.status(500).json({ msg: 'فشل رفع الصورة أو حفظ البيانات' });
  }
});

module.exports = router;
