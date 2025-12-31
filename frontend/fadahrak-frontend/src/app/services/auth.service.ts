import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

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

      // تنظيف أي صورة ديفولت قديمة فقط
      if (
        user.profileImage &&
        (
          user.profileImage.includes('default.jpg') ||
          user.profileImage.includes('default-avatar')
        )
      ) {
        user.profileImage = DEFAULT_AVATAR;
      }

      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    const cleanedUser = { ...user };

    if (
      cleanedUser.profileImage &&
      cleanedUser.profileImage.includes('default.jpg')
    ) {
      cleanedUser.profileImage = DEFAULT_AVATAR;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(cleanedUser));
    this.userSubject.next(cleanedUser);

    console.log('تم حفظ التوكن والمستخدم');
  }

  /**
   * ✅ تحديث المستخدم الحالي بالكامل
   * يُستدعى بعد:
   * - getProfile
   * - updateProfile
   */
  updateCurrentUser(updatedUser: any) {
    if (!updatedUser) return;

    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.userSubject.next(updatedUser);

    console.log('تم تحديث بيانات المستخدم محليًا');
  }

  /**
   * تحديث صورة البروفايل من الـ Socket (real-time)
   */
  handleProfileUpdate(data: {
    userId: string;
    profileImage: string;
    cacheBuster: number;
  }) {
    const currentUser = this.getUser();
    if (!currentUser) return;

    if (
      currentUser._id !== data.userId &&
      currentUser.id !== data.userId
    ) {
      return;
    }

    const updatedUser = {
      ...currentUser,
      profileImage: data.profileImage
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.userSubject.next(updatedUser);

    console.log('تم تحديث صورة البروفايل real-time عبر Socket');
  }

  /**
   * (اختياري) تجديد كاش الصورة يدويًا
   */
  forceRefreshImage() {
    const current = this.userSubject.value;
    if (!current || !current.profileImage) return;

    try {
      const url = new URL(current.profileImage);
      url.searchParams.set('v', Date.now().toString());

      const updated = {
        ...current,
        profileImage: url.toString()
      };

      localStorage.setItem('user', JSON.stringify(updated));
      this.userSubject.next(updated);

      console.log('تم تجديد كاش الصورة قسريًا');
    } catch {
      // في حالة إن الرابط مش URL صالح
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
