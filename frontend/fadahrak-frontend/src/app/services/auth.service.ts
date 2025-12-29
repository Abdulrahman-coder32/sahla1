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
      this.refreshImageCache(user); // تجديد الكاش للصورة عند التحميل
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
    const userCopy = { ...updatedUser };
    this.refreshImageCache(userCopy); // تجديد الكاش في كل تحديث
    localStorage.setItem('user', JSON.stringify(userCopy));
    this.userSubject.next(userCopy);
    console.log('تم تحديث بيانات المستخدم في AuthService:', userCopy);
  }

  private refreshImageCache(user: any) {
    if (user?.profileImage) {
      // نجدد الـ timestamp في كل مرة يتم فيها تحميل أو تحديث
      const timestamp = Date.now();
      const separator = user.profileImage.includes('?') ? '&' : '?';
      user.profileImage = `${user.profileImage}${separator}t=${timestamp}`;
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
      this.refreshImageCache(user); // تجديد عند كل get
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
