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
    <div class="min-h-screen py-16 px-4 sm:py-20 sm:px-6 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div class="max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
        <div class="card p-6 sm:p-8 lg:p-10">
          <h1 class="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 flex justify-center items-center">
            <i class="fas fa-user-plus icon text-primary mr-2"></i>إنشاء حساب جديد
          </h1>
          <form (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div class="relative">
              <i class="fas fa-envelope absolute right-4 top-4 text-gray-500"></i>
              <input [(ngModel)]="form.email" name="email" type="email" placeholder="البريد الإلكتروني" class="input-field pr-12" required aria-label="أدخل البريد الإلكتروني">
            </div>
            <div class="relative">
              <i class="fas fa-key absolute right-4 top-4 text-gray-500"></i>
              <input [(ngModel)]="form.password" name="password" type="password" placeholder="كلمة المرور" class="input-field pr-12" required aria-label="أدخل كلمة المرور">
            </div>
            <div class="relative">
              <i class="fas fa-user absolute right-4 top-4 text-gray-500"></i>
              <input [(ngModel)]="form.name" name="name" placeholder="الاسم الكامل" class="input-field pr-12" required aria-label="أدخل الاسم الكامل">
            </div>
            <div class="relative">
              <i class="fas fa-birthday-cake absolute right-4 top-4 text-gray-500"></i>
              <input [(ngModel)]="form.age" name="age" type="number" placeholder="العمر" class="input-field pr-12" required aria-label="أدخل العمر">
            </div>
            <div class="relative">
              <i class="fas fa-map-marker-alt absolute right-4 top-4 text-gray-500"></i>
              <input [(ngModel)]="form.governorate" name="governorate" placeholder="المحافظة" class="input-field pr-12" required aria-label="أدخل المحافظة">
            </div>
            <div class="relative">
              <i class="fas fa-city absolute right-4 top-4 text-gray-500"></i>
              <input [(ngModel)]="form.city" name="city" placeholder="المدينة" class="input-field pr-12" required aria-label="أدخل المدينة">
            </div>
            <div class="md:col-span-2">
              <label class="block text-gray-700 mb-2 flex items-center">
                <i class="fas fa-user-tag icon mr-2"></i>نوع الحساب
              </label>
              <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <label class="flex items-center cursor-pointer">
                  <input type="radio" [(ngModel)]="form.role" name="role" value="job_seeker" class="form-radio text-primary" aria-label="باحث عن عمل">
                  <span class="mr-2">باحث عن عمل</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input type="radio" [(ngModel)]="form.role" name="role" value="shop_owner" class="form-radio text-primary" aria-label="صاحب محل">
                  <span class="mr-2">صاحب محل</span>
                </label>
              </div>
            </div>

            <div *ngIf="form.role === 'job_seeker'" class="md:col-span-2 animate-fade-in">
              <div class="relative">
                <i class="fas fa-briefcase absolute right-4 top-4 text-gray-500"></i>
                <input [(ngModel)]="form.work_experience" name="work_experience" placeholder="الخبرة المهنية" class="input-field pr-12" aria-label="أدخل الخبرة المهنية">
              </div>
              <div class="relative mt-4">
                <i class="fas fa-tags absolute right-4 top-4 text-gray-500"></i>
                <input [(ngModel)]="form.desired_job_type" name="desired_job_type" placeholder="نوع الوظيفة المرغوبة" class="input-field pr-12" aria-label="أدخل نوع الوظيفة المرغوبة">
              </div>
            </div>

            <div *ngIf="form.role === 'shop_owner'" class="md:col-span-2 animate-fade-in">
              <div class="relative">
                <i class="fas fa-store absolute right-4 top-4 text-gray-500"></i>
                <input [(ngModel)]="form.shop_name" name="shop_name" placeholder="اسم المحل" class="input-field pr-12" aria-label="أدخل اسم المحل">
              </div>
            </div>

            <div class="md:col-span-2">
              <button type="submit" [disabled]="loading" class="btn-primary w-full py-3 sm:py-4 ripple flex items-center justify-center" aria-label="إنشاء الحساب">
                <ng-container *ngIf="!loading; else loadingSpinner">
                  <i class="fas fa-user-plus icon mr-2"></i>إنشاء الحساب
                </ng-container>
                <ng-template #loadingSpinner>
                  <i class="fas fa-spinner fa-spin icon mr-2"></i>جاري الإنشاء...
                </ng-template>
              </button>
            </div>
          </form>
          <p *ngIf="error" class="text-danger text-center mt-4 flex items-center justify-center md:col-span-2">
            <i class="fas fa-exclamation-triangle icon mr-2"></i>{{ error }}
          </p>
          <p class="text-center mt-4 sm:mt-6 text-gray-600 md:col-span-2">
            لديك حساب؟ <a routerLink="/login" class="text-primary hover:underline">تسجيل الدخول</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  form = {
    email: '',
    password: '',
    role: 'job_seeker',
    name: '',
    age: null,
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
