import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private readonly DEFAULT_PROFILE_IMAGE = 'https://res.cloudinary.com/dv48puhaq/image/upload/c_fill,f_auto,g_face,h_400,q_auto,r_max,w_400/v1/sahla-profiles/user_6952db5df93f29893fdccc59';

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      let user = JSON.parse(storedUser);

      // تنظيف أي default قديمة
      if (!user.profileImage || user.profileImage.includes('default.jpg') ||
          user.profileImage.includes('default-avatar') ||
          user.profileImage.includes('photo_2025-12-29_21-17-37')) {
        user.profileImage = `${this.DEFAULT_PROFILE_IMAGE}?t=${Date.now()}`;
      }

      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage:', user);
    }
  }

  setUser(user: any, token: string) {
    if (!user.profileImage) {
      user.profileImage = `${this.DEFAULT_PROFILE_IMAGE}?t=${Date.now()}`;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    console.log('تم حفظ التوكن والمستخدم:', user);
  }

  updateCurrentUser(updatedUser: any) {
    const current = this.userSubject.value;
    const mergedUser = { ...current, ...updatedUser };

    // **الحل الأساسي**: نأخذ الصورة الجديدة دايماً من الـ backend (مش نحتفظ بالقديمة)
    // لو الـ backend رد بدون profileImage، نستخدم الديفولت الجديد
    if (!mergedUser.profileImage) {
      mergedUser.profileImage = `${this.DEFAULT_PROFILE_IMAGE}?t=${Date.now()}`;
    }

    // تنظيف أي default قديمة
    if (mergedUser.profileImage && (
      mergedUser.profileImage.includes('default.jpg') ||
      mergedUser.profileImage.includes('default-avatar')
    )) {
      mergedUser.profileImage = `${this.DEFAULT_PROFILE_IMAGE}?t=${Date.now()}`;
    }

    localStorage.setItem('user', JSON.stringify(mergedUser));
    this.userSubject.next(mergedUser);
    console.log('تم تحديث المستخدم:', mergedUser);

    // **تجديد قوي للصورة** بعد كل تحديث
    this.forceRefreshImage();
  }

  forceRefreshImage() {
    const current = this.userSubject.value;
    if (!current) return;

    const userCopy = { ...current };

    // إذا كان فيه صورة جديدة → نجدد الـ timestamp
    if (userCopy.profileImage) {
      // نزيل أي query قديمة
      let base = userCopy.profileImage.split('?')[0];
      userCopy.profileImage = `${base}?t=${Date.now()}&refresh=${Date.now()}`;
    } else {
      // لو مفيش صورة → نستخدم الديفولت الجديد
      userCopy.profileImage = `${this.DEFAULT_PROFILE_IMAGE}?t=${Date.now()}`;
    }

    localStorage.setItem('user', JSON.stringify(userCopy));
    this.userSubject.next(userCopy);
    console.log('تم تجديد كاش الصورة بقوة:', userCopy.profileImage);
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
    return user && user.role === role;
  }
}
