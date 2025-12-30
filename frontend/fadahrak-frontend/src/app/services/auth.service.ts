import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

      // تنظيف أي default قديم
      if (user.profileImage && (
        user.profileImage.includes('default.jpg') ||
        user.profileImage.includes('default-avatar') ||
        user.profileImage.includes('res.cloudinary.com') && user.profileImage.includes('default')
      )) {
        user.profileImage = this.addCacheBuster(
          'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg',
          Date.now()
        );
      }

      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    let cleanedUser = { ...user };

    // تنظيف الصورة لو كانت default قديم
    if (cleanedUser.profileImage && cleanedUser.profileImage.includes('default.jpg')) {
      cleanedUser.profileImage = this.addCacheBuster(
        'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg',
        Date.now()
      );
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

    // لو الـ backend مرجعش profileImage، نحتفظ بالحالي
    if (!updatedUser.profileImage && current.profileImage) {
      mergedUser.profileImage = current.profileImage;
    }

    // إضافة cache buster تلقائي لو الصورة موجودة
    if (mergedUser.profileImage && typeof mergedUser.profileImage === 'string') {
      mergedUser.profileImage = this.addCacheBuster(mergedUser.profileImage, mergedUser.cacheBuster || Date.now());
    }

    localStorage.setItem('user', JSON.stringify(mergedUser));
    this.userSubject.next(mergedUser);
    console.log('تم تحديث بيانات المستخدم محليًا');
  }

  // جديد: معالجة تحديث الصورة من السوكت
  handleProfileUpdate(data: { userId: string; profileImage: string; cacheBuster: number }) {
    const currentUser = this.getUser();
    if (!currentUser || currentUser.id !== data.userId) return;

    const updated = {
      ...currentUser,
      profileImage: this.addCacheBuster(data.profileImage, data.cacheBuster || Date.now())
    };

    localStorage.setItem('user', JSON.stringify(updated));
    this.userSubject.next(updated);
    console.log('تم تحديث صورة البروفايل real-time عبر Socket');
  }

  // دالة مساعدة لإضافة ?v= أو تحديثه
  private addCacheBuster(url: string, version: number): string {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${version}`;
  }

  forceRefreshImage() {
    const current = this.userSubject.value;
    if (current && current.profileImage) {
      const newUrl = this.addCacheBuster(current.profileImage, Date.now());
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
