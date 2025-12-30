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

      // التعديل المهم: حذف أي default.jpg قديم من localStorage
      if (user.profileImage && (
        user.profileImage.includes('default.jpg') || 
        user.profileImage.includes('default-avatar')
      )) {
        user.profileImage = null;
        console.log('تم حذف default image قديمة من localStorage وتحويلها إلى null');
      }

      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    // تنظيف قبل الحفظ
    if (user.profileImage && user.profileImage.includes('default.jpg')) {
      user.profileImage = null;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    console.log('تم حفظ التوكن والمستخدم في localStorage');
  }

  updateCurrentUser(updatedUser: any) {
    const current = this.userSubject.value;
    const mergedUser = { ...current, ...updatedUser };

    // حماية مهمة: لو الـ backend رد بدون profileImage، نحتفظ بالقديم
    if (!updatedUser.profileImage && current?.profileImage) {
      mergedUser.profileImage = current.profileImage;
      console.log('حافظنا على الصورة القديمة عند التحديث');
    }

    // تنظيف default image لو موجودة في التحديث
    if (mergedUser.profileImage && mergedUser.profileImage.includes('default.jpg')) {
      mergedUser.profileImage = null;
    }

    localStorage.setItem('user', JSON.stringify(mergedUser));
    this.userSubject.next(mergedUser);
    console.log('تم تحديث بيانات المستخدم في AuthService:', mergedUser);
  }

  forceRefreshImage() {
    const current = this.userSubject.value;
    if (current && current.profileImage) {
      const userCopy = { ...current };
      const separator = userCopy.profileImage.includes('?') ? '&' : '?';
      userCopy.profileImage = `${userCopy.profileImage}${separator}refresh=${Date.now()}`;
      localStorage.setItem('user', JSON.stringify(userCopy));
      this.userSubject.next(userCopy);
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
    return user && user.role === role;
  }
}
