import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen py-16 px-4 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div class="max-w-md mx-auto">
        <div class="card p-8">
          <h1 class="text-3xl font-bold text-center mb-6">تسجيل الدخول</h1>
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <input [(ngModel)]="form.email" name="email" type="email" placeholder="البريد الإلكتروني" class="input-field" required>
            <input [(ngModel)]="form.password" name="password" type="password" placeholder="كلمة المرور" class="input-field" required>
            <button type="submit" [disabled]="loading" class="btn-primary w-full py-3">
              {{ loading ? 'جاري الدخول...' : 'دخول' }}
            </button>
          </form>
          <p *ngIf="error" class="text-red-600 text-center mt-4">{{ error }}</p>
          <p class="text-center mt-6">
            ليس لديك حساب؟
            <a routerLink="/signup" class="text-primary font-semibold">إنشاء حساب</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form = { email: '', password: '' };
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.api.login(this.form).subscribe({
      next: (res) => {
        this.authService.setUser(res.user, res.token);
        this.notificationService.refreshAll(); // 🔥 تشغيل الإشعارات + socket بعد التوكن
        this.router.navigate([res.user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard']);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.msg || 'خطأ في تسجيل الدخول';
      }
    });
  }
}
