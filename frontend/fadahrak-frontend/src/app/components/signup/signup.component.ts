import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signup-container">
      <div class="max-w-2xl mx-auto">
        <div class="signup-card">
          <div class="card-header">
            <i class="fas fa-user-plus"></i>
            <h1>إنشاء حساب جديد</h1>
          </div>

          <form (ngSubmit)="onSubmit()" class="signup-form">
            <div class="form-grid">
              <div class="input-group">
                <i class="fas fa-envelope"></i>
                <input [(ngModel)]="form.email" name="email" type="email" placeholder="البريد الإلكتروني" class="form-input" required>
              </div>

              <div class="input-group">
                <i class="fas fa-key"></i>
                <input [(ngModel)]="form.password" name="password" type="password" placeholder="كلمة المرور" class="form-input" required>
              </div>

              <div class="input-group">
                <i class="fas fa-user"></i>
                <input [(ngModel)]="form.name" name="name" placeholder="الاسم الكامل" class="form-input" required>
              </div>

              <div class="input-group">
                <i class="fas fa-birthday-cake"></i>
                <input [(ngModel)]="form.age" name="age" type="number" placeholder="العمر" class="form-input" required>
              </div>

              <div class="input-group">
                <i class="fas fa-map-marker-alt"></i>
                <input [(ngModel)]="form.governorate" name="governorate" placeholder="المحافظة" class="form-input" required>
              </div>

              <div class="input-group">
                <i class="fas fa-city"></i>
                <input [(ngModel)]="form.city" name="city" placeholder="المدينة" class="form-input" required>
              </div>
            </div>

            <!-- نوع الحساب -->
            <div class="role-section">
              <label class="role-label">
                <i class="fas fa-user-tag"></i>
                نوع الحساب
              </label>
              <div class="role-options">
                <label class="role-option">
                  <input type="radio" [(ngModel)]="form.role" name="role" value="job_seeker">
                  <span>باحث عن عمل</span>
                </label>
                <label class="role-option">
                  <input type="radio" [(ngModel)]="form.role" name="role" value="shop_owner">
                  <span>صاحب محل</span>
                </label>
              </div>
            </div>

            <!-- حقول إضافية للباحث عن عمل -->
            <div *ngIf="form.role === 'job_seeker'" class="extra-fields">
              <div class="input-group">
                <i class="fas fa-briefcase"></i>
                <input [(ngModel)]="form.work_experience" name="work_experience" placeholder="الخبرة المهنية" class="form-input">
              </div>
              <div class="input-group">
                <i class="fas fa-tags"></i>
                <input [(ngModel)]="form.desired_job_type" name="desired_job_type" placeholder="نوع الوظيفة المرغوبة" class="form-input">
              </div>
            </div>

            <!-- حقل إضافي لصاحب المحل -->
            <div *ngIf="form.role === 'shop_owner'" class="extra-fields">
              <div class="input-group">
                <i class="fas fa-store"></i>
                <input [(ngModel)]="form.shop_name" name="shop_name" placeholder="اسم المحل" class="form-input">
              </div>
            </div>

            <!-- زر الإرسال -->
            <div class="submit-section">
              <button type="submit" [disabled]="loading" class="submit-btn">
                <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                <i class="fas fa-user-plus" *ngIf="!loading"></i>
                {{ loading ? 'جاري الإنشاء...' : 'إنشاء الحساب' }}
              </button>
            </div>

            <!-- رسالة خطأ -->
            <p *ngIf="error" class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              {{ error }}
            </p>

            <!-- رابط تسجيل الدخول -->
            <p class="login-prompt">
              لديك حساب؟
              <a routerLink="/login" class="login-link">تسجيل الدخول</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      padding: 3rem 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
      display: flex;
      align-items: center;
    }

    .signup-card {
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

    .signup-form {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr 1fr;
      }
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
      padding: 1rem 3rem 1rem 3rem;
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

    .role-section {
      margin: 2rem 0;
    }

    .role-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
      font-size: 1.125rem;
    }

    .role-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .role-options {
        flex-direction: row;
        gap: 2rem;
      }
    }

    .role-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 1rem;
      border-radius: 1rem;
      background: #F8FAFC;
      transition: all 0.3s ease;
    }

    .role-option:hover {
      background: #E0F2FE;
    }

    .role-option input[type="radio"] {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: #0EA5E9;
    }

    .extra-fields {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-top: 1rem;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .submit-section {
      margin-top: 2rem;
    }

    .submit-btn {
      width: 100%;
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
      margin-top: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .login-prompt {
      text-align: center;
      margin-top: 2rem;
      color: #6B7280;
      font-size: 1.125rem;
    }

    .login-link {
      color: #0EA5E9;
      font-weight: 700;
      text-decoration: underline;
    }

    .login-link:hover {
      color: #0284C7;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .signup-container { padding: 1.5rem 1rem; }
      .card-header { padding: 1.5rem 1rem; }
      .card-header h1 { font-size: 2rem; }
      .signup-form { padding: 1.5rem; }
      .submit-btn { font-size: 1.125rem; }
    }
  `]
})
export class SignupComponent {
  form = {
    email: '',
    password: '',
    role: 'job_seeker' as 'job_seeker' | 'shop_owner',
    name: '',
    age: null as number | null,
    governorate: '',
    city: '',
    work_experience: '',
    desired_job_type: '',
    shop_name: ''
  };

  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.api.signup(this.form).subscribe({
      next: (res) => {
        this.authService.setUser(res.user, res.token);
        this.loading = false;
        this.router.navigate([res.user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error.msg || 'خطأ في إنشاء الحساب';
      }
    });
  }
}
