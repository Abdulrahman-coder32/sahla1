import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      this.userSubject.next(JSON.parse(storedUser));
      console.log('تم تحميل المستخدم من localStorage');
    }
  }

  setUser(user: any, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    console.log('تم حفظ التوكن والمستخدم في localStorage');
  }

  /** جديد: تحديث بيانات المستخدم الحالي (يُستخدم بعد تعديل البروفايل) */
  updateCurrentUser(updatedUser: any) {
    // تحديث localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // تحديث BehaviorSubject عشان كل الكومبوننتس تتحدث فورًا
    this.userSubject.next(updatedUser);

    console.log('تم تحديث بيانات المستخدم في AuthService:', updatedUser);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    console.log('تم تسجيل الخروج');
  }

  // دالة جلب المستخدم الحالي
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
