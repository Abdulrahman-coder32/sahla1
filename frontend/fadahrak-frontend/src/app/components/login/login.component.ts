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
    <div class="login-container">
      <div class="max-w-md mx-auto">
        <div class="login-card">
          <div class="card-header">
            <i class="fas fa-sign-in-alt"></i>
            <h1>تسجيل الدخول</h1>
          </div>

          <form (ngSubmit)="onSubmit()" class="login-form">
            <div class="input-group">
              <i class="fas fa-envelope"></i>
              <input [(ngModel)]="form.email" name="email" type="email" placeholder="البريد الإلكتروني" class="form-input" required>
            </div>

            <div class="input-group">
              <i class="fas fa-key"></i>
              <input [(ngModel)]="form.password" name="password" type="password" placeholder="كلمة المرور" class="form-input" required>
            </div>

            <button type="submit" [disabled]="loading" class="submit-btn">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              {{ loading ? 'جاري الدخول...' : 'دخول' }}
            </button>

            <p *ngIf="error" class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              {{ error }}
            </p>

            <p class="signup-prompt">
              ليس لديك حساب؟
              <a routerLink="/signup" class="signup-link">إنشاء حساب</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      padding: 3rem 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
      display: flex;
      align-items: center;
    }

    .login-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      overflow: hidden;
    }

    .card-header {
      text-align: center;
      padding: 2rem 1.5rem 1.5rem;
      border-bottom: 1px solid #E5E7EB;
    }

    .card-header i {
      font-size: 2.5rem;
      color: #0EA5E9;
      margin-bottom: 1rem;
    }

    .card-header h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: #1F2937;
      margin: 0;
    }

    .login-form {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .input-group {
      position: relative;
    }

    .input-group i {
      position: absolute;
      right: 1rem;
      top: 1.125rem;
      color: #0EA5E9;
      font-size: 1.125rem;
      z-index: 10;
    }

    .form-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border-radius: 1rem;
      border: 1px solid #D1D5DB;
      background: #FFFFFF;
      font-size: 1.0625rem;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #0EA5E9;
      box-shadow: 0 0 0 3px #E0F2FE;
    }

    .submit-btn {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.25rem;
      padding: 1rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .submit-btn:hover:not(:disabled) {
      background: #B2DDFA;
      transform: translateY(-2px);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      text-align: center;
      background: #FEE2E2;
      color: #DC2626;
      padding: 1rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .signup-prompt {
      text-align: center;
      margin-top: 1rem;
      color: #6B7280;
      font-size: 1.125rem;
    }

    .signup-link {
      color: #0EA5E9;
      font-weight: 700;
      text-decoration: underline;
    }

    .signup-link:hover {
      color: #0284C7;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .login-container { padding: 1.5rem 1rem; }
      .card-header { padding: 1.5rem 1rem; }
      .card-header h1 { font-size: 2rem; }
      .login-form { padding: 1.5rem; gap: 1.25rem; }
      .submit-btn { font-size: 1.125rem; }
    }
  `]
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
        this.notificationService.refreshAll(); // تشغيل الإشعارات + socket بعد التوكن
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
