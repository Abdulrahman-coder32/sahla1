import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const DEFAULT_AVATAR = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      let user = JSON.parse(storedUser);

      // تنظيف الصور الديفولت القديمة فقط (لو كانت روابط قديمة بدون cache buster صحيح)
      if (user.profileImage && (
        user.profileImage.includes('default.jpg') ||
        user.profileImage.includes('default-avatar') ||
        (user.profileImage.includes('res.cloudinary.com') && user.profileImage.includes('default') && !user.profileImage.includes('?v='))
      )) {
        user.profileImage = DEFAULT_AVATAR; // الباك إند هيعمل cache busting لما يجيب البروفايل
      }

      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    let cleanedUser = { ...user };

    // تنظيف default قديم فقط عند اللوجين/ساين أب
    if (cleanedUser.profileImage && cleanedUser.profileImage.includes('default.jpg')) {
      cleanedUser.profileImage = DEFAULT_AVATAR;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(cleanedUser));
    this.userSubject.next(cleanedUser);
    console.log('تم حفظ التوكن والمستخدم');
  }

  updateCurrentUser(updatedUser: any) {
    const current = this.userSubject.value;
    if (!current) return;

    const mergedUser = { ...current, ...updatedUser };

    // لو الـ backend مرجعش profileImage جديد، نحتفظ بالحالي (اللي فيه cache buster صحيح)
    if (!updatedUser.profileImage && current.profileImage) {
      mergedUser.profileImage = current.profileImage;
    }
    // لو مرجع profileImage جديد، نستخدمه كما هو (الباك إند مرجعه جاهز مع ?v=)
    // مفيش داعي نعدل عليه أو نضيف cache buster يدوي

    localStorage.setItem('user', JSON.stringify(mergedUser));
    this.userSubject.next(mergedUser);
    console.log('تم تحديث بيانات المستخدم محليًا');
  }

  // معالجة تحديث الصورة من السوكت (real-time)
  handleProfileUpdate(data: { userId: string; profileImage: string; cacheBuster: number }) {
    const currentUser = this.getUser();
    if (!currentUser || currentUser._id !== data.userId && currentUser.id !== data.userId) return;

    const updated = {
      ...currentUser,
      profileImage: data.profileImage // الباك إند بعت الرابط جاهز مع cache buster صحيح
    };

    localStorage.setItem('user', JSON.stringify(updated));
    this.userSubject.next(updated);
    console.log('تم تحديث صورة البروفايل real-time عبر Socket');
  }

  // تم حذف addCacheBuster بالكامل لأنها كانت بتخرب الرابط

  // دالة لتجديد الصورة قسريًا لو احتجنا (اختياري، ممكن تحتفظ بيها للطوارئ)
  forceRefreshImage() {
    const current = this.userSubject.value;
    if (current && current.profileImage) {
      // نضيف timestamp جديد فقط على الرابط الحالي
      const url = new URL(current.profileImage);
      url.searchParams.set('v', Date.now().toString());
      const newUrl = url.toString();

      const updated = { ...current, profileImage: newUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      this.userSubject.next(updated);
      console.log('تم تجديد كاش الصورة قسريًا');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    console.log('تم تسجيل الخروج');
  }

  getUser() {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }
}
