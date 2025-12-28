import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private cacheBuster = Date.now(); // ← نستخدمه لكسر كاش الصور

  constructor() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      // لو فيه صورة قديمة → نضيف timestamp قديم عشان ما يتغيرش فجأة
      if (user?.profileImage) {
        user.profileImage = this.appendCacheBuster(user.profileImage);
      }
      this.userSubject.next(user);
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    const userCopy = { ...user };
    if (userCopy?.profileImage) {
      userCopy.profileImage = this.appendCacheBuster(userCopy.profileImage);
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userCopy));
    this.userSubject.next(userCopy);
    console.log('تم حفظ التوكن والمستخدم في localStorage');
  }

  updateCurrentUser(updatedUser: any) {
    const userCopy = { ...updatedUser };

    // كسر الكاش للصورة لو موجودة
    if (userCopy?.profileImage) {
      userCopy.profileImage = this.appendCacheBuster(userCopy.profileImage);
      this.cacheBuster = Date.now(); // تحديث القيمة للمرة القادمة
    }

    localStorage.setItem('user', JSON.stringify(userCopy));
    this.userSubject.next(userCopy);

    console.log('تم تحديث بيانات المستخدم في AuthService:', userCopy);
  }

  private appendCacheBuster(url: string): string {
    // لو الـ URL فيه query string بالفعل → نضيف &t=...
    // لو مفيهوش → نضيف ?t=...
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${this.cacheBuster}`;
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
