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

      // تنظيف أي default image قديمة من localStorage
      if (user.profileImage && (
        user.profileImage.includes('default.jpg') ||
        user.profileImage.includes('default-avatar') ||
        user.profileImage.includes('photo_2025-12-29_21-17-37') // إضافة الديفولت بتاعتك
      )) {
        user.profileImage = null;
        console.log('تم حذف default image قديمة من localStorage وتحويلها إلى null');
      }

      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage:', user);
    }
  }

  setUser(user: any, token: string) {
    // تنظيف قبل الحفظ
    if (user.profileImage && (
      user.profileImage.includes('default.jpg') ||
      user.profileImage.includes('default-avatar')
    )) {
      user.profileImage = null;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    console.log('تم حفظ التوكن والمستخدم في localStorage:', user);
  }

  updateCurrentUser(updatedUser: any) {
    const current = this.userSubject.value;
    const mergedUser = { ...current, ...updatedUser };

    // حذف الشرط القديم اللي بيحافظ على الصورة القديمة
    // → الباك بيرجع الرابط الجديد دايماً، فما نحتاجش نحميه

    // تنظيف default image لو موجودة في التحديث
    if (mergedUser.profileImage && (
      mergedUser.profileImage.includes('default.jpg') ||
      mergedUser.profileImage.includes('default-avatar')
    )) {
      mergedUser.profileImage = null;
    }

    localStorage.setItem('user', JSON.stringify(mergedUser));
    this.userSubject.next(mergedUser);
    console.log('تم تحديث بيانات المستخدم في AuthService:', mergedUser);

    // تجديد كاش الصورة تلقائيًا بعد كل تحديث
    this.forceRefreshImage();
  }

  forceRefreshImage() {
    const current = this.userSubject.value;
    if (current && current.profileImage) {
      const userCopy = { ...current };

      // نزيل أي query parameters قديمة (تجنب التكرار)
      let base = userCopy.profileImage.split('?')[0];

      // إضافة timestamp جديد + refresh لضمان تحديث فوري
      const separator = base.includes('?') ? '&' : '?';
      userCopy.profileImage = `${base}${separator}t=${Date.now()}&refresh=${Date.now()}`;

      localStorage.setItem('user', JSON.stringify(userCopy));
      this.userSubject.next(userCopy);
      console.log('تم تجديد كاش الصورة قسريًا:', userCopy.profileImage);
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
    return user && user.role === role;
  }
}
