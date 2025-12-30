const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// الصورة الديفولت والدالة المساعدة (نفس اللي في users.js)
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

const getProfileImageUrl = (publicId, cacheBuster = 0) => {
  const url = publicId
    ? `https://res.cloudinary.com/dv48puhaq/image/upload/v${cacheBuster}/sahla-profiles/${publicId}`
    : DEFAULT_AVATAR;
  return `${url}?v=${cacheBuster}`;
};

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, role, ...profile } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ msg: 'بيانات ناقصة' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'المستخدم موجود بالفعل' });
    }

    const hashed = await bcrypt.hash(password, 10);

    user = new User({
      email,
      password: hashed,
      role,
      cacheBuster: 0, // صراحة عشان الكاش يبدأ صح
      ...profile
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const imageUrl = getProfileImageUrl(user.profileImage, user.cacheBuster || 0);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileImage: imageUrl,
        cacheBuster: user.cacheBuster || 0,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        governorate: user.governorate,
        city: user.city,
        age: user.age,
        work_experience: user.work_experience,
        desired_job_type: user.desired_job_type,
        shop_name: user.shop_name,
        ...profile
      }
    });
  } catch (err) {
    console.error('خطأ في إنشاء الحساب:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'بيانات ناقصة' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'بيانات غير صحيحة' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: 'بيانات غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const imageUrl = getProfileImageUrl(user.profileImage, user.cacheBuster || 0);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileImage: imageUrl,
        cacheBuster: user.cacheBuster || 0,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        governorate: user.governorate,
        city: user.city,
        age: user.age,
        work_experience: user.work_experience,
        desired_job_type: user.desired_job_type,
        shop_name: user.shop_name
      }
    });
  } catch (err) {
    console.error('خطأ في تسجيل الدخول:', err);
    res.status(500).json({ msg: 'خطأ في السيرفر' });
  }
});

module.exports = router;
