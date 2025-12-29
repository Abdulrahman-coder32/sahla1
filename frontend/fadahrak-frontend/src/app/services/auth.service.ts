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
      const user = JSON.parse(storedUser);
      this.refreshImageCache(user);
      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    const userCopy = { ...user };
    this.refreshImageCache(userCopy);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userCopy));
    this.userSubject.next(userCopy);
    console.log('تم حفظ التوكن والمستخدم في localStorage');
  }

  updateCurrentUser(updatedUser: any) {
    const current = this.userSubject.value;
    const userCopy = { ...updatedUser };

    // حماية: لو الـ update مفيهوش profileImage → نحتفظ بالقديم
    if (!userCopy.profileImage && current?.profileImage) {
      userCopy.profileImage = current.profileImage;
      console.log('حافظنا على الصورة القديمة في updateCurrentUser');
    }

    this.refreshImageCache(userCopy);
    localStorage.setItem('user', JSON.stringify(userCopy));
    this.userSubject.next(userCopy);
    console.log('تم تحديث بيانات المستخدم في AuthService:', userCopy);
  }

  private refreshImageCache(user: any) {
    if (user?.profileImage) {
      const timestamp = Date.now();
      // تنظيف الـ query string القديمة (كل ?t=... المتكررة)
      const clean = user.profileImage.split('?')[0];
      const separator = clean.includes('?') ? '&' : '?';
      user.profileImage = `${clean}${separator}t=${timestamp}`;
      console.log('تم تنظيف وتجديد الكاش للصورة:', user.profileImage);
    }
  }

  forceRefreshCache() {
    const current = this.userSubject.value;
    if (current) {
      const userCopy = { ...current };
      this.refreshImageCache(userCopy);
      localStorage.setItem('user', JSON.stringify(userCopy));
      this.userSubject.next(userCopy);
      console.log('تم تجديد الكاش قسريًا للصورة');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    console.log('تم تسجيل الخروج');
  }

  getUser() {
    const user = this.userSubject.value;
    if (user) {
      this.refreshImageCache(user);
    }
    return user;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user && user.role === role;
  }
}
