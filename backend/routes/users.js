const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const { getProfileImageUrl } = require('../utils/imageUtils');

const router = express.Router();

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
router.put('/profile', auth, async (req, res) => {
  try {
    const body = req.body || {};
    const { name, phone, bio, profileImage } = body;
    const updates = {};
    const inc = {};
    let cacheBusterIncremented = false;

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;

    // رفع صورة جديدة
    if (profileImage && profileImage.startsWith('data:image')) {
      try {
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: 'sahla-profiles',
          public_id: `user_${req.user.id}`,
          overwrite: true,
          resource_type: 'image',
        });
        updates.profileImage = result.public_id;
        inc.cacheBuster = 1;
        cacheBusterIncremented = true;
      } catch (cloudErr) {
        console.error('خطأ رفع الصورة على Cloudinary:', cloudErr);
        return res.status(500).json({ msg: 'فشل رفع الصورة. حاول مرة أخرى.' });
      }
    } else if (profileImage === null || profileImage === '') {
      updates.profileImage = null;
      updates.cacheBuster = 0;
      cacheBusterIncremented = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(Object.keys(updates).length && { $set: updates }),
        ...(Object.keys(inc).length && { $inc: inc }),
      },
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

    // إرسال تحديث real-time عبر Socket.IO
    if (cacheBusterIncremented) {
      const io = req.app.get('io');
      if (io) {
        // التحقق أن المستخدم مشترك في الـ room
        const socketRoom = io.sockets.adapter.rooms.get(req.user.id.toString());
        if (socketRoom) {
          io.to(req.user.id.toString()).emit('profileUpdated', {
            userId: req.user.id,
            profileImage: imageUrl,
            cacheBuster: finalCacheBuster,
          });
        } else {
          console.warn('Socket.IO: المستخدم غير مشترك في room profileUpdated');
        }
      }
    }
  } catch (err) {
    console.error('خطأ تحديث البروفايل:', err);
    res.status(500).json({ msg: 'فشل حفظ البيانات' });
  }
});

module.exports = router;
